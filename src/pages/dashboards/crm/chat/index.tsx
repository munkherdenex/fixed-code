import {
  EuiAvatar,
  EuiBadge,
  EuiButton,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiHorizontalRule,
  EuiListGroup,
  EuiListGroupItem,
  EuiLoadingSpinner,
  EuiPage,
  EuiPageBody,
  EuiPageSidebar,
  EuiSpacer,
  EuiText,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import DashboardCRMLayout from "../../../../layouts/dashboard_crm";
import ChatMessage from "../../../../components/chat/chat_message";
import useGetRootChatLogs from "../../../../hooks/useGetRootChatLogs";
import useSWRInfinite from "swr/infinite";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import contactLogApi from "../../../../api/contact_log";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import useGetCustomers, { CustomersResponse } from "../../../../hooks/useGetCustomers";
import { PAGINATION_CHOOSES } from "../../../../constants";
import moment from "moment";

const chatCss = `
  .chat-container {
    border: 1px solid #ccc;
    border-radius: 5px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 400px;
  }

  .message-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .message-bubble {
    border: 1px solid #ccc;
    border-radius: 20px;
    padding: 10px 5px;
    margin-bottom: 10px;
    max-width: 70%;
    clear: both;
    display: flex;
    align-items: flex-start;
    position: relative;
  }

  .user-message {
    background-color: #e0f2f7;
    float: right;
    align-self: flex-end;
  }

  .other-message {
    background-color: #ffffff;
    float: left;
    align-self: flex-start; /* Align other messages to the left */
  }

  .message-timestamp {
    font-size: 12px;
    color: #999;
    margin-top: 5px;
    clear: both;
    order: 2;
    margin-left: auto;
    vertical-align: middle;
  }

  .message-content{
    order: 1;
    word-wrap: break-word;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin: 5px;
  }
  .user-avatar{
    margin-left: auto;
  }

  .input-area {
    border-top: 1px solid #ccc;
    padding: 10px;
    display: flex;
  }

  .input-field {
    flex-grow: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-right: 5px;
  }
  .send-button{
    padding: 8px 12px;
    background-color: #4CAF50; /* Green */
    border: none;
    color: white;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
  }
  .root-chat-wrapper {
    border: 1px solid #ccc;
    border-radius: 5px;
    display: flex;
    padding: 10px 5px;
    margin: 0px 10px 0px 0px;
    cursor: pointer;
    transition: all 0.1s ease-out;
  }
  .root-chat-wrapper:hover{
    background: #e6e6e6;
  }
`;

const schema = yup
  .object({
    customer: yup
      .array()
      .of(
        yup
          .object({
            label: yup.string().notRequired(),
            value: yup.string().required("please enter audience"),
          })
          .required("please enter audience"),
      )
      .required("please enter audience"),
  })
  .required();

type AudienceFormData = yup.InferType<typeof schema>;

const Chat = () => {
  interface ChatMessage {
    id: number;
    // fb_profile: FbProfile;
    customer_id: number | null;
    type: string;
    body: string;
    source: string;
    email: string | null;
    phone: string | null;
    team_id: number | null;
    chat_is_root: boolean;
    chat_id: string;
    chat_state: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    chat_parent: number;
    chat_from: number;
    chat_to: number | null;
    created_by: number | null;
    updated_by: number | null;
  }

  interface FbProfile {
    psid: number;
    first_name: string;
    last_name: string;
    middle_name: string;
    name: string;
    name_format: string;
    picture: string;
    short_name: string;
  }

  interface ChatMessagesResponse {
    next: string | null;
    previous: string | null;
    results: ChatMessage[];
  }
  //Chat list, log states
  const [sideBar, setSideBar] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChatFbProfile, setSelectedChatFbProfile] = useState(null);
  // const [fbUserId, setFbUserId] = useState<number | null>(null);
  // Chat input States
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedOptions, setSelectedOptions] = useState([]);

  const { data: segmentCustomers } = useGetCustomers<CustomersResponse>(null, {
    limit: `${PAGINATION_CHOOSES[3]}`,
  });
  const { rootChatLogs, isLoadingRootChat, isErrorRootChat } = useGetRootChatLogs(10, null);

  const audienceForm = useForm<AudienceFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      customer: [],
    },
  });

  // Chat list, log fetching
  const fetcher = (url: string) => axios.get<ChatMessagesResponse>(url).then((res) => res.data);
  const getKey = (pageIndex: number, previousPageData: ChatMessagesResponse | null) => {
    if (selectedChatId) {
      if (previousPageData && !previousPageData.next) return null;
      if (pageIndex === 0) return `/api/v1/dj/crm/fbchat/chat/${selectedChatId}/`;
      return (
        `/api/v1/dj/crm/fbchat/chat/${selectedChatId}/?cursor=` + (previousPageData?.next ?? null)
      );
    }
    return null;
  };
  const { data, size, setSize, isValidating, mutate } = useSWRInfinite<ChatMessagesResponse>(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      fallbackData: [],
    },
  );

  const messages = data?.flatMap((page) => page?.results || []) || [];
  const hasMoreMessages = data?.[data.length - 1]?.next !== null;

  //For chat infinite scrolling
  const observer = useRef<IntersectionObserver | null>(null);
  const lastChat = useCallback(
    (node: HTMLDivElement) => {
      if (isValidating) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreMessages) {
          setSize(size + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isValidating, hasMoreMessages, size, setSize],
  );

  //For initial chat log fetching
  const handleClickChat = (rootId: string, fbUserId: number, fbProfile: FbProfile) => {
    setSelectedChatId(rootId);
    // setFbUserId(fbUserId);
    setSelectedChatFbProfile(fbProfile);
  };

  // Chat input handlers
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);

      await mutate(async (pages: any) => {
        const optimisticMessage = {
          id: Date.now(),
          body: message.trim(),
          created_at: new Date().toISOString(),
          isOptimistic: true,
        };

        return (
          pages?.map((page, index) =>
            index === 0 ? { ...page, results: [optimisticMessage, ...(page.results || [])] } : page,
          ) || []
        );
      }, false);

      await contactLogApi.sendChat({
        psid: selectedChatFbProfile.psid,
        text: message.trim(),
      });

      // await mutate();
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      mutate();
      setErrorMessage("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      console.log(data);
      handleSendMessage();
    }
  };

  const handleAssignButton = async () => {
    const id = selectedOptions[0].value;
    console.log(id);
    console.log(selectedChatFbProfile.psid);
    await contactLogApi.assignPsidToCustomer({
      psid: selectedChatFbProfile.psid,
      customer_id: id,
    });
  };

  const getImgUrl = (str: string | null | undefined): string | null => {
    if (!str) {
      return null;
    }

    try {
      const fixedStr = str.replace(/'/g, '"').replace(/False/g, "false");
      const obj = JSON.parse(fixedStr);
      return obj?.data?.url || null;
    } catch (error) {
      console.error("Failed to parse JSON:", error);
      return null;
    }
  };

  const dataTypeOptions: EuiComboBoxOptionOption[] =
    segmentCustomers?.results?.map((customer) => {
      return {
        label: customer?.email || customer?.phone || customer?.rid,
        "aria-label": `${customer?.email} ${customer?.phone} ${customer?.rid}`,
        value: String(customer?.id),
        append: <EuiBadge>{customer?.phone || customer?.email || customer?.rid}</EuiBadge>,
      };
    }) || [];

  if (!data) return <div>Loading chat messages...</div>;

  return (
    <>
      <style>{chatCss}</style>
      <DashboardCRMLayout>
        <EuiPage paddingSize="none" grow={true}>
          {sideBar && (
            <EuiPageSidebar
              paddingSize="none"
              // style={{ borderRight: "1px solid black", marginRight: "15px" }}
            >
              <EuiSpacer size="xxl" />
              <div style={{ display: "flex", flexDirection: "column", marginTop: "8px" }}>
                {rootChatLogs?.results.map((log: any) => (
                  <div
                    className="root-chat-wrapper"
                    key={log.id}
                    style={{
                      backgroundColor: selectedChatId === log.id ? "#e6e6e6" : "",
                    }}
                    onClick={() => handleClickChat(log.id, log.chat_from, log.fb_profile)}
                  >
                    <EuiAvatar
                      size="m"
                      name={log.fb_profile.first_name}
                      imageUrl={getImgUrl(log.fb_profile.picture)}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        marginLeft: "5px",
                      }}
                    >
                      <span>{log.fb_profile.name}</span>
                      <span style={{ marginTop: "5px", fontSize: "10px", opacity: 0.8 }}>
                        {(log.chat_from ? log.body : "You: " + log.body) +
                          " · " +
                          moment(log.last_active_at).format("MMMM D, YYYY")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </EuiPageSidebar>
          )}
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <EuiFlexGroup justifyContent="flexEnd">
                <EuiFlexItem>
                  <EuiForm component="form" style={{ display: "flex", justifyContent: "end" }}>
                    <EuiFormRow
                      isInvalid={
                        !!audienceForm.formState.errors.customer?.message ||
                        !!audienceForm.formState.errors.customer?.[0]?.value?.message
                      }
                      error={[
                        audienceForm.formState.errors.customer?.message ||
                          audienceForm.formState.errors.customer?.[0]?.value?.message,
                      ]}
                    >
                      <Controller
                        control={audienceForm.control}
                        name="customer"
                        render={({ field: { value, onBlur, onChange } }) => (
                          <EuiComboBox
                            placeholder="Search"
                            singleSelection={{ asPlainText: true }}
                            options={dataTypeOptions}
                            onChange={(selected) => {
                              setSelectedOptions(selected);
                              onChange(selected);
                            }}
                            selectedOptions={[{ label: (value && value[0]?.label) || "" }]}
                            onBlur={onBlur}
                            isClearable={false}
                            isLoading={isLoading}
                            isDisabled={!selectedChatId}
                          />
                        )}
                      />
                    </EuiFormRow>
                  </EuiForm>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton
                    disabled={!selectedChatId || selectedOptions?.length == 0}
                    onClick={() => {
                      handleAssignButton();
                    }}
                  >
                    Assign
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>

              <EuiSpacer size="s" />
              <EuiPageBody paddingSize="m" panelled={true}>
                <div className="chat-container">
                  <div
                    className="message-list"
                    style={{
                      overflowY: "auto",
                      height: "70vh",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column-reverse",
                    }}
                  >
                    <EuiFlexGroup direction="columnReverse" gutterSize="s">
                      {messages
                        .sort(
                          (a, b) =>
                            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                        )
                        .map((message, idx) => {
                          if (messages.length === idx + 1) {
                            return (
                              <div ref={lastChat} key={message.id}>
                                <ChatMessage
                                  id={message.id}
                                  isToMe={message.chat_from && !message.chat_to}
                                  name={"You"}
                                  message={message.body}
                                  timestamp={message.created_at}
                                />
                              </div>
                            );
                          } else {
                            return (
                              <ChatMessage
                                key={message.id}
                                id={message.id}
                                isToMe={message.chat_from && !message.chat_to}
                                name={"User One"}
                                message={message.body}
                                timestamp={message.created_at}
                              />
                            );
                          }
                        })}
                      {isValidating && (
                        <EuiFlexItem>
                          <EuiLoadingSpinner size="l" />
                        </EuiFlexItem>
                      )}
                      {/* {!hasMoreMessages && (
                        <EuiFlexItem>
                          <EuiText textAlign="center">No more messages</EuiText>
                        </EuiFlexItem>
                      )} */}
                    </EuiFlexGroup>
                  </div>
                  <div className="input-area">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading || !selectedChatId}
                    />

                    <button
                      className="send-button"
                      onClick={handleSendMessage}
                      style={{ opacity: !selectedChatId ? "0.6" : 1, cursor: "auto" }}
                      disabled={isLoading || !message.trim() || !selectedChatId}
                    >
                      {!selectedChatId ? "Чат сонгоно уу" : isLoading ? "Sending..." : "Send"}
                    </button>

                    {/* {errorMessage && <div className="error-message">{errorMessage}</div>} */}
                  </div>
                </div>
              </EuiPageBody>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPage>
      </DashboardCRMLayout>
    </>
  );
};

export default Chat;
