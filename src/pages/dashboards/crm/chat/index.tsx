import {
  EuiAvatar,
  EuiBadge,
  EuiButton,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiContextMenu,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiLoadingSpinner,
  EuiPage,
  EuiPageSidebar,
  EuiPopover,
  EuiTab,
  EuiTabs,
} from "@elastic/eui";
import DashboardCRMChatLayout from "@/layouts/dashboard_crm_chat";
import ChatMessage from "@/components/chat/chat_message";
import useGetRootChatLogs from "@/hooks/useGetRootChatLogs";
import useSWRInfinite from "swr/infinite";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import contactLogApi from "@/api/contact_log";
import fbPageConfigApi, { FBPageConfig, FBPageConfigResponse } from "@/api/fb_page_config";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import useGetCustomers, { CustomersResponse } from "@/hooks/useGetCustomers";
import { PAGINATION_CHOOSES } from "@/constants";
import moment from "moment";
import { GetStaticProps } from "next/types";
import { extractMessage, getImgUrl } from "@/components/chat/utils";
import { css } from '@emotion/react';

const chatCss = `
  .chat-container {
    background-color: #f9f9f9;
    border: 1px solid #ccc;
    border-radius: 5px;
    display: block;
    flex-direction: column;
    height: 600px;
    padding: 0 10px;
    max-height: 600px;
    overflow-y: auto;
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
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px;
    background-color: #f1f1f1;
    border-top: 1px solid #ccc;
    height: 60px;
    max-height: 60px;
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
    flex-direction: row;
    padding: 10px 5px;
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

  // Interface for chat groups (Facebook pages, embedded chat)
  interface ChatGroup {
    id: string;
    name: string;
    type: 'facebook' | 'embedded' | 'other';
    icon?: string;
    active: boolean;
  }

  interface ChatGroupsResponse {
    results: ChatGroup[];
  }

  // Define possible tab types
  type RootChatTabType = 'all' | 'unread' | 'flagged' | 'closed';
  
  //Chat list, log states
  const [sideBar, setSideBar] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedChatFbProfile, setSelectedChatFbProfile] = useState(null);
  // const [fbUserId, setFbUserId] = useState<number | null>(null);
  // Chat input States
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedOptions, setSelectedOptions] = useState([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Chat groups states
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [isSelectPagePopoverOpen, setIsSelectPagePopoverOpen] = useState(false);
  const [isLoadingChatGroups, setIsLoadingChatGroups] = useState(false);
  const [selectedChatGroup, setSelectedChatGroup] = useState<ChatGroup | null>(null);
  const [currentRootChatTab, setCurrentRootChatTab] = useState<string>('open-chats-tab');
  const contextMenuPopoverId = 'contextMenuPopover';

  const { data: segmentCustomers } = useGetCustomers<CustomersResponse>(null, {
    limit: `${PAGINATION_CHOOSES[3]}`,
  });
  const { rootChatLogs, isLoadingRootChat, isErrorRootChat } = useGetRootChatLogs(10, null);

  // Function to fetch chat groups
  const fetchChatGroups = async () => {
    try {
      setIsLoadingChatGroups(true);
      const response: FBPageConfigResponse = await fbPageConfigApi.getList();
      
      // Create a default "All Pages" option
      const allPagesOption: ChatGroup = {
        id: "all",
        name: "Бүх хуудас",
        type: 'other' as const,
        active: !selectedChatGroup, // Make it active by default if no chat group is selected
      };
      
      // Convert FB page configs to ChatGroup format
      const chatGroupsFromPages = response.results.map(page => ({
        id: page.page_id,
        name: page.page_name || 'Unnamed Page',
        type: 'facebook' as const,
        active: page.is_enabled,
      }));
      
      // Add the "All Pages" option at the top
      setChatGroups([allPagesOption, ...chatGroupsFromPages]);
      
      // Set initial selected chat group if available
      if (!selectedChatGroup) {
        setSelectedChatGroup(allPagesOption);
      }
    } catch (error) {
      console.error("Error fetching chat groups:", error);
    } finally {
      setIsLoadingChatGroups(false);
    }
  };

  // Load chat groups when component mounts
  useEffect(() => {
    fetchChatGroups();
  }, []);

  // Popover control functions
  const toggleSelectPagePopover = () => {
    setIsSelectPagePopoverOpen(!isSelectPagePopoverOpen);
  };

  const closeSelectPagePopover = () => {
    setIsSelectPagePopoverOpen(false);
  };

  const handleSelectChatGroup = (chatGroup: ChatGroup) => {
    setSelectedChatGroup(chatGroup);
    closeSelectPagePopover();
    // You may want to filter the chat logs based on the selected group here
  };

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

  // Add a ref to track if we're loading more messages from scrolling up
  const isLoadingOlderMessages = useRef(false);

  // Effect to scroll to bottom when messages change or a new chat is selected
  useEffect(() => {
    if (messages.length > 0 && !isLoadingOlderMessages.current) {
      scrollToBottom();
    }
    // Reset the flag after the effect runs
    isLoadingOlderMessages.current = false;
  }, [messages.length, selectedChatId]);

  //For chat infinite scrolling
  const observer = useRef<IntersectionObserver | null>(null);
  const lastChat = useCallback(
    (node: HTMLDivElement) => {
      if (isValidating) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreMessages) {
          // Set flag to indicate we're loading older messages
          isLoadingOlderMessages.current = true;
          setSize(size + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isValidating, hasMoreMessages, size, setSize],
  );

  // Function to scroll chat container to bottom
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  //For initial chat log fetching
  const handleClickChat = (rootChat, rootId: string, fbUserId: number, fbProfile: FbProfile) => {
    setSelectedChatId(rootId);
    setSelectedPageId(rootChat.source_id);
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
        page_id: selectedPageId,
        psid: selectedChatFbProfile.psid,
        text: message.trim(),
      });

      // await mutate();
      setMessage("");
      // Scroll to bottom after sending a message
      setTimeout(scrollToBottom, 100);
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

  // Function to handle tab selection
  const onSelectRootChatTab = (tabId: string) => {
    setCurrentRootChatTab(tabId);
    // Additional logic to filter chats based on the selected tab
    // You might want to make an API call with the selected tab as a parameter
    // For example, to show only open or closed chats
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
  
  // Create button for chat groups popover
  const selectPageButton = (
    <div style={{
      backgroundColor: "#F5F7FA", 
      borderRadius: "8px", 
      padding: "10px", 
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
      width: "100%",
    }}
    onClick={toggleSelectPagePopover}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ 
          width: "40px", 
          height: "40px", 
          borderRadius: "50%", 
          backgroundColor: "#F05252", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          marginRight: "15px",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
        }}>
          <span style={{ color: "white", fontWeight: "bold", fontSize: "18px" }}>P</span>
        </div>
        <div>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>
            {selectedChatGroup ? selectedChatGroup.name : 'Select Chat Group'}
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "#69707D", fontSize: "14px" }}>
            <span style={{ marginRight: "5px" }}>Бүгд</span>
            <span style={{ 
              backgroundColor: "#D3DAE6", 
              borderRadius: "4px", 
              padding: "1px 6px",
              fontSize: "12px"
            }}>
              12
            </span>
          </div>
        </div>
      </div>
      <div>
        {isLoadingChatGroups ? (
          <EuiLoadingSpinner size="m" />
        ) : (
          <span style={{ fontSize: "20px" }}>▼</span>
        )}
      </div>
    </div>
  );

  // Create panels for context menu
  const panels = [
    {
      id: 0,
      title: 'Chat Groups',
      items: chatGroups.map((group) => ({
        name: group.name,
        icon: group.type === 'facebook' ? 'logoFacebook' : 'message',
        onClick: () => handleSelectChatGroup(group),
      })),
    },
  ];

  if (!data) return <div>Loading chat messages...</div>;

  return (
    <>
      <style>{chatCss}</style>
      <DashboardCRMChatLayout>
        <EuiFlexGroup>
          <EuiFlexItem grow={1} css={css`
              margin: 12px;
            `}>
            <EuiFlexGrid columns={1} gutterSize="s">
              {isLoadingRootChat && (
                <EuiFlexItem>
                  <EuiLoadingSpinner size="xl" />
                </EuiFlexItem>
              )}
              {isErrorRootChat && <EuiFlexItem>Error loading chat logs</EuiFlexItem>}
              <EuiPopover
                id={contextMenuPopoverId}
                button={selectPageButton}
                isOpen={isSelectPagePopoverOpen}
                closePopover={closeSelectPagePopover}
                panelPaddingSize="none"
                anchorPosition="downLeft"
              >
                <EuiContextMenu initialPanelId={0} panels={panels} />
              </EuiPopover>

              <EuiTabs>
                <EuiTab
                  key={'open-chats-tab'}
                  onClick={() => onSelectRootChatTab('open-chats-tab')}
                  isSelected={currentRootChatTab === 'open-chats-tab'}
                  append={3}
                >
                  Нээлттэй
                </EuiTab>
                <EuiTab
                  key={'closed-chats-tab'}
                  onClick={() => onSelectRootChatTab('closed-chats-tab')}
                  isSelected={currentRootChatTab === 'closed-chats-tab'}
                  append={2}
                >
                  Хаалттай
                </EuiTab>
              </EuiTabs>

              {!isLoadingRootChat &&
                rootChatLogs?.results
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.last_active_at).getTime() - new Date(a.last_active_at).getTime(),
                ).map((rootChat) => (
                  <EuiFlexItem
                    key={rootChat.id}
                    className="root-chat-wrapper"
                    onClick={() =>
                      handleClickChat(
                        rootChat,
                        rootChat.id,
                        rootChat.fb_profile.psid,
                        rootChat.fb_profile,
                      )
                    }
                  >
                    <EuiAvatar
                      name={rootChat.fb_profile.name}
                      imageUrl={getImgUrl(rootChat.fb_profile.picture)}
                      size="m"
                      className="avatar"
                    />
                    <div>
                      <strong>{rootChat.fb_profile.name}</strong>
                      <p>{extractMessage(rootChat.body)}</p>
                      <span>{moment(rootChat.created_at).fromNow()}</span>
                    </div>
                  </EuiFlexItem>
                ))}
            </EuiFlexGrid>
          </EuiFlexItem>
          <EuiFlexItem  grow={3} style={{ background: "#F7F8FC" }}>
A
          </EuiFlexItem>
          <EuiFlexItem grow={1}>
BV
          </EuiFlexItem>
        </EuiFlexGroup>
      </DashboardCRMChatLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const common = (await import(`../../../../messages/${context.locale}/common.json`)).default;
  const chat = (await import(`../../../../messages/${context.locale}/chat.json`)).default;

  return {
    props: {
      messages: {
        ...common,
        ...chat,
      },
    },
  };
};

export default Chat;
