// @ts-nocheck

import useSWR from "swr";
import { useRouter } from "next/router";
import ticketApi from "../../../../../api/ticket";
import {
  EuiAvatar,
  EuiBadge,
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiComboBox,
  EuiComment,
  EuiCommentList,
  EuiCommentProps,
  EuiFieldNumber,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiHorizontalRule,
  EuiInlineEditText,
  EuiInlineEditTitle,
  EuiMarkdownEditor,
  EuiMarkdownFormat,
  EuiConfirmModal,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiEmptyButton,
  EuiSplitPanel,
  EuiPanel,
  EuiSelect,
  EuiTab,
  EuiPopover,
  EuiSpacer,
  EuiSwitch,
  EuiText,
  EuiTextArea,
  EuiFormControlLayout,
  EuiTitle,
  formatDate,
  htmlIdGenerator,
  useGeneratedHtmlId,
  EuiTabs,
  EuiColorPicker,
  EuiIcon,
  EuiFlexGrid,
} from "@elastic/eui";
import DashboardCRMLayout from "../../../../../layouts/dashboard_crm";
import { Controller, useForm } from "react-hook-form";
import getFieldComponentEdit from "../../../../../components/ticket_template/edit_utils";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ticketTemplateApi from "../../../../../api/ticket_template";
import moment from "moment";
import WorkersSelect from "../../../../../components/ticket_template/worker_select";
import TagsManager from "../../../../../components/ticket_template/tags";
import tagApi from "@/api/tags";
import useTeams from "@/hooks/useTeams";
import useGetCurrentTeamMembers from "@/hooks/useCurrentTeamMembers";
import { MembersType, TeamMembersType } from "@/constants/members.types";
import CustomersSelect from "@/components/ticket_template/customers_select";
import { addToast } from "@/components/toast";

// interface Ticket {
//   id: string;
//   category: string;
//   created_at: string;
//   updated_at: string;
//   description: string;
//   status: string;
// }

interface Field {
  id: number;
  attr_name: string;
  value: string;
  type: "number" | "text";
  config: {
    max?: number;
    min?: number;
    step?: number;
    helpText?: string;
    isRequired?: boolean;
    isMultiline?: boolean;
  };
}

interface ValueType {
  old_value?: {
    value?: string;
    emoji?: string;
  };
}

interface Tag {
  id: number;
  name: string;
  color: string;
}

interface TagsResponse {
  results: Tag[];
}

const transformInputLabel = (attrName, template: any): string => {
  if (template) {
    const field = template?.fields.find((field) => field.attr_name === attrName);
    return field ? field.name : "";
  }
  return "";
};

const transformDataToComments = (results, ticketTemplate: any): EuiCommentProps[] => {
  return results.map((result) => {
    const { id, body, type, created_at, created_by, data } = result;

    let message = "";
    let event = "";
    let eventColor: "subdued" | "primary" | "success" | "danger" | "warning" | undefined;

    if (type === "update" && data.changes) {
      const changes = Object.entries(data.changes)
        .map(([key, value]) => {
          if (ticketTemplate) {
            const field = ticketTemplate?.fields.find((field) => field.attr_name === key);
            const fieldName = field ? field.name : key;
            const oldValue = (value as ValueType).old_value;
            return `"${fieldName}" changed from "${oldValue?.value ? oldValue.value + " " + oldValue.emoji : oldValue}"`;
          }
          return "";
        })
        .join(", ");
      message = `Updated: `;
      event = `Updated: ${changes}`;
      eventColor = "warning";
    } else if (type === "open") {
      event = `Ticket opened`;
      eventColor = "success";
    } else {
      message = body || "";
      eventColor = "subdued";
    }

    const comment: EuiCommentProps = {
      // created_by will be an object
      username: `${created_by}`,
      event,
      eventColor,
      timestamp: moment(created_at).format("YYYY-MM-DD LT"),
    };

    if (type !== "update" && type !== "open") {
      comment.children = <p>{message}</p>;
    }

    return comment;
  });
};

const statusOptions = [
  {
    label: "Open",
    value: "open",
  },
  {
    label: "Close",
    value: "close",
  },
];

const tabs = [
  {
    id: "cobalt--id",
    name: "Түүх",
  },
];

const needCallBackOptions = [
  { value: false, text: "Үгүй" },
  { value: true, text: "Тийм" },
];

const contactedChannelOptions = [
  { value: "Дуудлага", text: "Дуудлага" },
  { value: "Чат", text: "Чат" },
  { value: "Салбар", text: "Салбар" },
];

const TicketDetailPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { id } = router.query;

  const [selectedTabId, setSelectedTabId] = useState("cobalt--id");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isTagAddPopoverOpen, setIsTagAddPopoverOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [ticketCloseDescription, setTicketCloseDescription] = useState("");
  const [value, setValue] = useState("");
  const [selectedOptions, setSelected] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTicketCloseModalVisible, setIsTicketCloseModalVisible] = useState(false);
  const [isEditConfirmModalVisible, setIsEditConfirmModalVisible] = useState(false);
  const [isPriorityAdded, setIsPriorityAdded] = useState(false);
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [priorityList, setPriorityList] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  // Form
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [addedTags, setAddedTags] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [needsCallbackValue, setNeedsCallbackValue] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [selectedPriorityDuration, setSelectedPriorityDuration] = useState(null);
  //
  const errorElementId = useRef(htmlIdGenerator()());
  const modalFormId = useGeneratedHtmlId({ prefix: "modalForm" });
  const modalTitleId = useGeneratedHtmlId();
  const editConfirmModalTitleId = useGeneratedHtmlId();
  const tagSelect = useGeneratedHtmlId();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();
  const [editorValue, setEditorValue] = useState("");
  const [selectedWorkerId, setSelectedWorkerId] = useState("");

  const {
    data,
    error,
    isLoading,
    mutate: mutatePage,
  } = useSWR(id ? `${id}` : null, ticketApi.getTicketById);
  const { data: ticketLogs, mutate: mutateLogs } = useSWR(
    `${id}/logs/`,
    ticketApi.getLogsByTicketId,
  );
  const { data: ticketTemplate } = useSWR(
    data?.ticket_template ? `/crm/ticket/${data.ticket_template}/` : null,
    data?.ticket_template ? () => ticketTemplateApi.getTemplateById(data.ticket_template) : null,
  );
  const {
    data: systemTags,
    mutate: mutateTags,
    error: errorTags,
  } = useSWR<TagsResponse>("/crm/tag/", () => tagApi.getTags({ limit: 1000 }));

  const { data: teamsList } = useTeams<Teams[]>();

  const {
    data: teamMembers,
    isLoading: isMembersLoading,
    mutateTeamMembers,
  } = useGetCurrentTeamMembers<TeamMembersType>(selectedTeam);

  const tagsSelectOptions = useMemo(() => {
    if (!systemTags?.results) {
      return [];
    }
    return systemTags.results.map((tag: Tag) => ({
      value: tag.id,
      text: tag.name,
    }));
  }, [systemTags]);

  const teamsSelectionOptions = useMemo(() => {
    if (!teamsList) {
      return [];
    }
    return teamsList.map((team) => ({
      value: team.id,
      text: team.name,
    }));
  }, [teamsList]);

  const teamsMembersSelectionOptions = useMemo(() => {
    if (!teamMembers) {
      return [];
    }
    return teamMembers?.members.map((member) => ({
      value: member.id,
      text: member?.user?.email,
    }));
  }, [teamMembers]);

  const selectedTabContent = useMemo(() => {
    return tabs.find((obj) => obj.id === selectedTabId)?.content;
  }, [selectedTabId]);

  useEffect(() => {
    if (data && data.title && data.title != "") {
      setTicketTitle(data.title);
    } else {
      setTicketTitle("Гарчиг нэмэх...");
    }

    if (data && data.body && data.body != "") {
      setTicketDescription(data.body);
    }
    // TODO: SET ALL OTHER VALUE HERE
  }, [data]);

  if (isLoading) return <div>Loading ticket details...</div>;

  if (!data) {
    return <div className="error">Ticket not found</div>;
  }

  if (error) {
    return (
      <div className="error">
        Error loading ticket: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  if (!ticketLogs) {
    return <EuiText>No logs found for this ticket.</EuiText>;
  }

  const ticketComments = transformDataToComments(
    ticketLogs
      ? ticketLogs?.results.sort((a, b) => {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        })
      : [],
    ticketTemplate,
  );

  const onSelectedTabChanged = (id: string) => {
    setSelectedTabId(id);
  };

  const onAddComment = async (comment: string) => {
    try {
      await ticketApi.postCommentOnTicket(id, { comment: editorValue });
      mutate();
      setEditorValue("");
    } catch (err) {
      console.error("Failed to submit comment:", err);
    }
  };

  const onCustomerSelect = (value) => {
    setSelectedCustomerId(value);
  };

  const handleWorkerSelect = async (selectedValue: string) => {
    try {
      console.log("Selected Value:", selectedValue);
      setSelectedWorkerId(selectedValue);
      let payload = {
        at_email: selectedValue,
      };
      await ticketApi.update(id, payload);
      // mutate("/crm/ticket/");
    } catch (error) {
      console.error("Failed to update ticket:", error);
      // mutate("/crm/ticket/");
    }
  };

  const onChange = (selectedOptions) => {
    console.log(selectedOptions);
    if (selectedOptions.length > 0 && selectedOptions[0]?.value != data.status) {
      setSelected(selectedOptions);
      setIsModalVisible(true);
    } else {
      setSelected([]);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    const status = statusOptions.find((el) => el.value == data.status);
    setSelected(status ? [status] : []);
  };

  const closeTicketCloseModal = () => {
    setIsTicketCloseModalVisible(false);
  };

  const saveEdit = async () => {
    try {
      let payload = {
        status: selectedOptions[0]?.value,
        comment: commentText,
      };
      await ticketApi.update(id, payload);
      mutatePage();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Failed to update ticket:", error);
      mutatePage();
    }
  };

  const onBadgeClick = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  const closeTagAddPopover = () => {
    setIsTagAddPopoverOpen(false);
  };

  const ticketTitleOnSave = async () => {
    try {
      let payload = {
        title: ticketTitle,
      };
      await ticketApi.update(id, payload);
    } catch (error) {
      console.error("Failed to update ticket:", error);
    }
  };

  const ticketTitleOnChange = (e) => {
    setTicketTitle(e.target.value);
  };

  const ticketDescriptionOnSave = async () => {
    try {
      let payload = {
        body: ticketDescription,
      };
      await ticketApi.update(id, payload);
    } catch (error) {
      console.error("Failed to update ticket:", error);
    }
  };

  const ticketDescriptionOnChange = (e) => {
    setTicketDescription(e.target.value);
  };

  const onNeedsCallbackChange = (e) => {
    setNeedsCallbackValue(e.target.value);
  };

  const addPriority = async () => {
    try {
      setIsPriorityAdded(true);
      let { results } = await ticketApi.getPriorityList();
      setPriorityList(results);
      const transformedData = results.map((item) => ({
        value: item.id,
        text: item.name,
      }));
      setPriorityOptions(transformedData);
    } catch (error) {
      console.error("Failed to update ticket:", error);
    }
  };

  const onChangePriority = (e) => {
    setSelectedPriority(e.target.value);
    let obj = priorityList.find((val) => val.id == e.target.value);
    setSelectedPriorityDuration(obj.duration + " минут");
  };

  const onTagAddButtonClick = () => {
    if (isTagAddPopoverOpen) {
      setIsTagAddPopoverOpen(false);
    } else {
      setIsTagAddPopoverOpen(true);
    }
  };

  const onTagChange = (e) => {
    if (!addedTags.some((el) => el.value == e.target.value)) {
      setSelectedTag(e.target.value);
    }

    const selectedId = e.target.value;
    // console.log(selectedId);
    if (!selectedId) {
      setSelectedTag(null);
      return;
    }
    const foundTag = tagsSelectOptions.find((tag) => tag.value == selectedId);
    console.log(foundTag);
    setAddedTags([...addedTags, foundTag]);
    setIsTagAddPopoverOpen(false);
  };

  const removeTag = (id) => {
    const updatedTags = addedTags.filter((tag) => tag.value != id);
    setAddedTags(updatedTags);
  };

  const handleTagAdd = () => {
    const selectedId = selectedTag;
    console.log(selectedId);
    if (!selectedId) {
      setSelectedTag(null);
      return;
    }
    console.log(tagsSelectOptions);
    const foundTag = tagsSelectOptions.find((tag) => tag.value == selectedId);
    console.log(foundTag);
    let arr = addedTags;
    arr.push(foundTag);
    setAddedTags(arr || []);
    // setIsTagAddPopoverOpen(false);
  };

  const onTeamChange = async (e) => {
    setSelectedTeamId(e.target.value);
    let team = teamsList.find((el) => el.id == e.target.value);
    setSelectedTeam(team || null);
    await mutateTeamMembers();
  };

  const onTeamMemberChange = (e) => {
    setSelectedMemberId(e.target.value);
  };

  const closeTicket = async () => {
    try {
      let payload = {
        body: ticketCloseDescription,
      };
      await ticketApi.close(id, payload);
    } catch (error) {
      console.error("Failed to update ticket:", error);
    }
  };

  const editTicket = async () => {
    try {
      let payload = {
        ...(ticketTitle != "" && { title: "Ticket gomdol test" }),
        ...(ticketDescription != "" && { body: ticketDescription }),
        ...(addedTags.length > 0 && { tags: addedTags }),
        ...(selectedCustomerId && { customer: selectedCustomerId }),
        // ...(selectedChannel && { channel: selectedChannel }),
        ...(needsCallbackValue && { needs_callback: needsCallbackValue }),
        ...(selectedTeamId && { assigned_team_id: selectedTeamId }),
        ...(selectedMemberId && { assigned_to: selectedMemberId }),
        ...(selectedPriority && { priority_id: selectedPriority }),
      };
      let { status } = await ticketApi.update(id, payload);
      if (status == "200") {
        addToast({
          id: "success",
          title: "Үүслээ",
          color: "success",
        });
      }
      setIsEditConfirmModalVisible(false);
    } catch (error) {
      setIsEditConfirmModalVisible(false);
      addToast({
        id: "success",
        title: "ERROR",
        color: "danger",
      });
      console.error("Failed to update ticket:", error);
    }
  };

  const badge = (
    <EuiBadge
      iconType="arrowDown"
      iconSide="right"
      onClick={onBadgeClick}
      onClickAriaLabel="Open dropdown"
      style={{ cursor: "pointer" }}
    >
      {data.status.toUpperCase()}
    </EuiBadge>
  );

  const dropdownContent = (
    <div
      style={{
        width: 200,
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        alignItems: "flex-start",
      }}
    >
      {statusOptions.map((option) => (
        <EuiButtonEmpty key={option.value} onClick={() => onChange([option])}>
          {option.label}
        </EuiButtonEmpty>
      ))}
    </div>
  );

  const tagAddButton = (
    <>
      <EuiButtonEmpty iconType="plusInCircle" color="primary" onClick={onTagAddButtonClick}>
        Төрөл нэмэх
      </EuiButtonEmpty>
    </>
  );

  const HeaderChildren = () => {
    return (
      <>
        <EuiBadge color="hollow">{"Тикет: #" + data?.id}</EuiBadge>
        <EuiBadge color="success" iconType="dot">
          {data?.status == "open" ? "Нээлттэй" : "Хаалттай"}
        </EuiBadge>
      </>
    );
  };

  return (
    <DashboardCRMLayout
      headerChildren={<HeaderChildren />}
      pageHeader={{
        pageTitle: data?.title || "Тикетийн гарчиг",
      }}
      breadCrumb={[
        {
          text: (
            <>
              <EuiButtonIcon
                display="base"
                iconType="arrowLeft"
                size="s"
                color="text"
                aria-label="back"
              />
            </>
          ),
          color: "primary",
          "aria-current": false,
          onClick: () => router.back(),
        },
        {
          text: "Тикет",
          onClick: () => router.push("/dashboards/crm/ticket?pageIndex=1&pageSize=10"),
        },
        {
          text: "Тикет дэлгэрэнгүй",
        },
      ]}
      rightSideItem={
        <EuiButton
          fill
          key="test value"
          iconType="crossInCircle"
          color="text"
          onClick={() => {
            setIsTicketCloseModalVisible(true);
          }}
        >
          Тикет хаах
        </EuiButton>
      }
    >
      <>
        {isTicketCloseModalVisible && (
          <EuiModal aria-labelledby={modalTitleId} onClose={closeTicketCloseModal}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>Тикет хаах</EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
              <strong>Тайлбар</strong>
              <EuiTextArea
                placeholder="Тикет хаах тайлбараа бичнэ үү."
                aria-label="Ticket close description area"
                value={ticketCloseDescription}
                onChange={(e) => setTicketCloseDescription(e.target.value)}
              />
            </EuiModalBody>

            <EuiModalFooter>
              <EuiButtonEmpty onClick={closeTicketCloseModal}>Болих</EuiButtonEmpty>
              <EuiButton type="submit" form={modalFormId} onClick={closeTicket} fill>
                Хаах
              </EuiButton>
            </EuiModalFooter>
          </EuiModal>
        )}
        {isEditConfirmModalVisible && (
          <EuiConfirmModal
            aria-labelledby={editConfirmModalTitleId}
            style={{ width: 600 }}
            title="Тикет хадгалах?"
            titleProps={{ id: editConfirmModalTitleId }}
            onCancel={() => setIsEditConfirmModalVisible(false)}
            onConfirm={editTicket}
            cancelButtonText="Болих"
            confirmButtonText="Хадгалах"
            defaultFocusedButton="confirm"
          ></EuiConfirmModal>
        )}
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiSplitPanel.Outer>
              <EuiFlexGroup direction="column" gutterSize="none">
                <EuiFlexItem>
                  <EuiSplitPanel.Inner color="subdued" paddingSize="m">
                    <EuiFlexItem grow={2}>
                      <EuiFlexItem grow={false}>
                        <strong>Ерөнхий мэдээлэл</strong>
                      </EuiFlexItem>
                    </EuiFlexItem>
                  </EuiSplitPanel.Inner>
                </EuiFlexItem>
                <EuiPanel paddingSize="l">
                  {isModalVisible && (
                    <EuiModal
                      aria-labelledby={modalTitleId}
                      onClose={closeModal}
                      initialFocus="[name=popswitch]"
                    >
                      <EuiModalHeader>
                        <EuiModalHeaderTitle id={modalTitleId}>
                          {selectedOptions[0].label}
                        </EuiModalHeaderTitle>
                      </EuiModalHeader>

                      <EuiModalBody>
                        <EuiMarkdownEditor
                          aria-label="Markdown editor"
                          aria-describedby={errorElementId.current}
                          placeholder="Add a comment..."
                          value={commentText}
                          onChange={setCommentText}
                          readOnly={isLoading}
                          height={400}
                          initialViewMode="editing"
                          markdownFormatProps={{ textSize: "s" }}
                        />
                      </EuiModalBody>

                      <EuiModalFooter>
                        <EuiButtonEmpty onClick={closeModal}>Cancel</EuiButtonEmpty>

                        <EuiButton type="submit" form={modalFormId} onClick={saveEdit} fill>
                          Save
                        </EuiButton>
                      </EuiModalFooter>
                    </EuiModal>
                  )}
                  {/* Категори */}
                  <EuiFlexGroup justifyContent="flexStart" alignItems="flexStart">
                    <EuiFlexItem grow={false}>
                      <div>
                        <span style={{ color: "red" }}>*</span>
                        <strong>Категори</strong>
                      </div>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <span style={{ color: "red" }}>{data?.category}</span>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                  <EuiSpacer size="m" />
                  {/* Тайлбар */}
                  <EuiFlexItem grow={false}>
                    <div>
                      <span style={{ color: "red" }}>*</span>
                      <strong>Тайлбар</strong>
                    </div>
                  </EuiFlexItem>
                  <EuiSpacer size="xs" />
                  <EuiTextArea
                    placeholder="Placeholder text"
                    value={ticketDescription}
                    onChange={ticketDescriptionOnChange}
                  />
                  <EuiSpacer size="m" />
                  {/* Төрөл */}
                  <EuiFlexGroup gutterSize="s" alignItems="center" justifyContent="flexStart">
                    <EuiFlexItem grow={false}>
                      <div>
                        <span style={{ color: "red" }}>*</span>
                        <strong>Төрөл</strong>
                      </div>
                    </EuiFlexItem>
                    {addedTags.length > 0 ? (
                      <EuiFlexGrid columns={3} gutterSize="s">
                        {addedTags.map((tag) => (
                          <EuiFlexItem grow={false} key={tag.value}>
                            <EuiBadge
                              iconSide="right"
                              iconType="cross"
                              iconOnClick={() => {
                                removeTag(tag.value);
                              }}
                            >
                              {tag.text}
                            </EuiBadge>
                          </EuiFlexItem>
                        ))}
                      </EuiFlexGrid>
                    ) : null}
                    <EuiPopover
                      button={tagAddButton}
                      isOpen={isTagAddPopoverOpen}
                      closePopover={closeTagAddPopover}
                    >
                      <EuiFormRow label="Tag Color">
                        <EuiSelect
                          id={tagSelect}
                          options={tagsSelectOptions}
                          value={selectedTag}
                          onChange={onTagChange}
                          aria-label="Use aria labels when no actual label is in use"
                        />
                      </EuiFormRow>
                      {/* <EuiButton onClick={handleTagAdd} fill>
                        Add
                      </EuiButton> */}
                    </EuiPopover>
                  </EuiFlexGroup>
                  <EuiSpacer size="m" />
                  {/* <TagsManager /> */}
                  {data?.tags.length > 0 ? (
                    <>
                      <EuiFlexGroup justifyContent="flexStart" alignItems="flexStart">
                        <EuiFlexItem grow={false}>
                          <div>
                            <span style={{ color: "red" }}>*</span>
                            <strong>Төрөл</strong>
                          </div>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false}>
                          <EuiFlexGroup wrap responsive={false} gutterSize="xs">
                            {data?.tags.map((tag) => (
                              <EuiFlexItem grow={false} key={tag.id}>
                                <EuiBadge color={tag.color}>{tag.name}</EuiBadge>
                              </EuiFlexItem>
                            ))}
                          </EuiFlexGroup>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                      <EuiSpacer size="m" />
                    </>
                  ) : null}
                  {/* Хэрэглэгчийн мэдээлэл */}
                  <EuiFlexItem grow={false}>
                    <div>
                      <span style={{ color: "red" }}>*</span>
                      <strong>Хэрэглэгчийн мэдээлэл</strong>
                    </div>
                  </EuiFlexItem>
                  <EuiSpacer size="xs" />
                  <CustomersSelect onSelect={onCustomerSelect} />
                  {/* <EuiSelect
                    fullWidth={true}
                    value={value}
                    onChange={(e) => onChange(e)}
                    aria-label="Use aria labels when no actual label is in use"
                  /> */}
                  <EuiSpacer size="m" />
                  {/* Холбогдсон суваг */}
                  <EuiFlexItem grow={false}>
                    <div>
                      <span style={{ color: "red" }}>*</span>
                      <strong>Холбогдсон суваг</strong>
                    </div>
                  </EuiFlexItem>
                  <EuiSpacer size="xs" />
                  <EuiSelect
                    hasNoInitialSelection
                    fullWidth={true}
                    options={contactedChannelOptions}
                    value={selectedChannel}
                    onChange={(e) => {
                      setSelectedChannel(e.target.value);
                    }}
                    aria-label="Use aria labels when no actual label is in use"
                  />
                  <EuiSpacer size="m" />
                  {/* Эргэн холбогдох */}
                  <EuiFlexItem grow={false}>
                    <div>
                      <span style={{ color: "red" }}>*</span>
                      <strong>Эргэн холбогдох</strong>
                    </div>
                  </EuiFlexItem>
                  <EuiSpacer size="xs" />
                  <EuiSelect
                    hasNoInitialSelection
                    options={needCallBackOptions}
                    value={needsCallbackValue}
                    onChange={(e) => onNeedsCallbackChange(e)}
                    fullWidth={true}
                    aria-label="Use aria labels when no actual label is in use"
                  />
                  <EuiSpacer size="m" />
                  {/* Хариуцах нэгж */}
                  <EuiFlexItem grow={false}>
                    <div>
                      <strong>Хариуцах нэгж/ажилтан</strong>
                    </div>
                  </EuiFlexItem>
                  <EuiSpacer size="xs" />
                  <EuiSelect
                    hasNoInitialSelection
                    fullWidth={true}
                    options={teamsSelectionOptions}
                    value={selectedTeamId}
                    onChange={(e) => onTeamChange(e)}
                    aria-label="Хариуцах нэгж"
                  />
                  {/* Хариуцах ажилтан */}
                  {selectedTeamId ? (
                    <>
                      <EuiSpacer size="m" />
                      <EuiFlexItem grow={false}>
                        <div>
                          <strong>Хариуцах ажилтан</strong>
                        </div>
                      </EuiFlexItem>
                      <EuiSpacer size="xs" />
                      <EuiSelect
                        fullWidth={true}
                        options={teamsMembersSelectionOptions}
                        value={selectedMemberId}
                        onChange={(e) => onTeamMemberChange(e)}
                        aria-label="Use aria labels when no actual label is in use"
                      />
                    </>
                  ) : null}
                  {/* Чухлын зэрэг */}
                  {data?.category == "Санал хүсэлт" || data?.category == "Гомдол" ? (
                    <>
                      {!isPriorityAdded ? (
                        <>
                          <EuiSpacer size="m" />
                          <EuiFlexGroup justifyContent="flexEnd">
                            <EuiButtonEmpty
                              size="s"
                              onClick={() => {
                                addPriority();
                              }}
                              iconType="plusInCircle"
                            >
                              Чухлын зэрэг нэмэх
                            </EuiButtonEmpty>
                          </EuiFlexGroup>
                        </>
                      ) : (
                        <>
                          <EuiSpacer size="m" />
                          <EuiFlexItem grow={false}>
                            <div>
                              <strong>Чухлын зэрэг</strong>
                            </div>
                          </EuiFlexItem>
                          <EuiSelect
                            fullWidth={true}
                            options={priorityOptions}
                            value={selectedPriority}
                            onChange={(e) => onChangePriority(e)}
                            aria-label="Use aria labels when no actual label is in use"
                          />
                          {selectedPriorityDuration && (
                            <>
                              <EuiSpacer size="m" />
                              <EuiFlexItem grow={false}>
                                <div>
                                  <strong>Шийдвэрлэх хугацаа</strong>
                                </div>
                              </EuiFlexItem>
                              <EuiFormControlLayout icon="clock" fullWidth={true}>
                                <EuiFieldText
                                  type="search"
                                  controlOnly
                                  value={selectedPriorityDuration}
                                  aria-label="Selected priority duration value"
                                  disabled={true}
                                  readOnly={true}
                                  fullWidth={true}
                                />
                              </EuiFormControlLayout>
                            </>

                            // <EuiFieldNumber
                            //   fullWidth={true}
                            //   options={[]}
                            //   value={selectedPriorityDuration}
                            //   disabled={true}
                            // />
                          )}
                        </>
                      )}
                    </>
                  ) : null}
                  {/* Save/Edit Button */}
                  {/* <TagsManager /> */}
                  <EuiSpacer size="m" />
                  <EuiFlexGroup justifyContent="flexEnd">
                    <EuiButton
                      color="success"
                      fill={true}
                      iconType="save"
                      onClick={() => setIsEditConfirmModalVisible(true)}
                    >
                      Хадгалах
                    </EuiButton>
                  </EuiFlexGroup>
                  {/* Тайлбар */}
                  {/* <EuiFlexItem grow={false}>
                  <strong>Тайлбар</strong>
                </EuiFlexItem>
                <EuiTextArea
                  fullWidth={true}
                  placeholder="Placeholder text"
                  aria-label="Use aria labels when no actual label is in use"
                  value={value}
                  onChange={(e) => onChange(e)}
                />
                <EuiSpacer size="m" /> */}
                  {/* Шалгуулах кэйс */}
                  {/* <EuiFlexItem grow={false}>
                  <div>
                    <strong>Шалгуулах кэйс</strong>
                  </div>
                </EuiFlexItem>
                <EuiSpacer size="xs" />
                <EuiSelect
                  fullWidth={true}
                  value={value}
                  onChange={(e) => onChange(e)}
                  aria-label="Use aria labels when no actual label is in use"
                />
                <EuiSpacer size="m" /> */}
                  {/* Шиидвэрлэх хугацаа */}
                  {/* <EuiFlexItem grow={false}>
                  <div>
                    <strong>Шиидвэрлэх хугацаа </strong>
                  </div>
                </EuiFlexItem>
                <EuiSpacer size="xs" />
                <EuiSelect
                  fullWidth={true}
                  value={value}
                  onChange={(e) => onChange(e)}
                  aria-label="Use aria labels when no actual label is in use"
                />
                <EuiSpacer size="m" /> */}
                  {/* <EuiSpacer size="m" />
                  <EuiTitle size="s">
                    <h4>Тикет: #{id}</h4>
                  </EuiTitle>
                  <EuiSpacer size="s" />
                  <EuiInlineEditTitle
                    inputAriaLabel="Edit ticket title"
                    heading="h1"
                    value={ticketTitle}
                    onSave={ticketTitleOnSave}
                    onChange={ticketTitleOnChange}
                    onCancel={(previousValue) => {
                      setTicketTitle(previousValue);
                    }}
                  />
                  <EuiSpacer size="s" />
                  <EuiInlineEditText
                    inputAriaLabel="Edit ticket description"
                    value={ticketDescription}
                    onSave={ticketDescriptionOnSave}
                    onChange={ticketDescriptionOnChange}
                    onCancel={(previousValue) => {
                      setTicketTitle(previousValue);
                    }}
                  />
                  <TagsManager /> */}
                </EuiPanel>
              </EuiFlexGroup>
            </EuiSplitPanel.Outer>
          </EuiFlexItem>
          {/* Bonus Fields */}
          {data.fields.length > 0 ? (
            <EuiFlexItem>
              <EuiSplitPanel.Outer>
                <EuiFlexGroup direction="column" gutterSize="none">
                  <EuiFlexItem>
                    <EuiSplitPanel.Inner color="subdued" paddingSize="m">
                      <EuiFlexItem grow={1}>
                        <EuiFlexItem grow={false}>
                          <strong>Нэмэлт мэдээлэл</strong>
                        </EuiFlexItem>
                      </EuiFlexItem>
                    </EuiSplitPanel.Inner>
                  </EuiFlexItem>
                  <EuiPanel paddingSize="l">
                    <EuiFlexItem>
                      {data.fields.map((field: Field) => {
                        return (
                          <Controller
                            key={`ctrllr__${field.id}`}
                            control={control}
                            name={field.attr_name}
                            render={({ field: { onChange, onBlur, value } }) => (
                              <EuiFormRow
                                key={field.id}
                                label={transformInputLabel(field.attr_name, ticketTemplate)}
                                helpText={field.config?.helpText}
                                fullWidth
                              >
                                {getFieldComponentEdit(field, register, value, onChange, onBlur)}
                              </EuiFormRow>
                            )}
                          />
                        );
                      })}
                    </EuiFlexItem>
                  </EuiPanel>
                </EuiFlexGroup>
              </EuiSplitPanel.Outer>
            </EuiFlexItem>
          ) : null}
          {/* Right-Side */}
          <EuiFlexItem>
            <EuiForm component="div">
              <EuiTabs>
                {tabs.map((tab, index) => (
                  <EuiTab
                    key={index}
                    href={tab.href}
                    onClick={() => onSelectedTabChanged(tab.id)}
                    isSelected={tab.id === selectedTabId}
                    disabled={tab.disabled}
                    prepend={tab.prepend}
                    append={tab.append}
                  >
                    {tab.name}
                  </EuiTab>
                ))}
              </EuiTabs>
              <EuiSpacer size="m" />
              <EuiFormRow fullWidth>
                <EuiCommentList comments={ticketComments} aria-label="Comment system">
                  <EuiComment username="You" timelineAvatar={<EuiAvatar name="You" />}>
                    <EuiMarkdownEditor
                      aria-label="Markdown editor"
                      aria-describedby={errorElementId.current}
                      placeholder="Add a comment..."
                      value={editorValue}
                      onChange={setEditorValue}
                      readOnly={isLoading}
                      initialViewMode="editing"
                      markdownFormatProps={{ textSize: "s" }}
                    />
                  </EuiComment>
                </EuiCommentList>
              </EuiFormRow>
              <EuiSpacer size="m" />
              {/* <EuiFlexGroup justifyContent="flexEnd" responsive={false}>
                <EuiFlexItem grow={false}>
                  <div>
                    <EuiButton
                      onClick={() => onAddComment}
                      isLoading={isLoading}
                      aria-label="comment Add"
                      isDisabled={editorValue == ""}
                    >
                      Add comment
                    </EuiButton>
                  </div>
                </EuiFlexItem>
              </EuiFlexGroup> */}
            </EuiForm>
            {/* <EuiPanel paddingSize="l">
              <EuiFlexGroup direction="row" justifyContent="flexStart" alignItems="center">
                <EuiFlexItem grow={false}>
                  <WorkersSelect
                    isLoading={false}
                    isDisabled={false}
                    onSelect={handleWorkerSelect}
                    initialValue={data?.assigned_to}
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiSpacer size="s" />
              <EuiForm component="div">
                <EuiFormRow label="Төлөв">
                  <EuiPopover
                    button={badge}
                    isOpen={isPopoverOpen}
                    closePopover={closePopover}
                    anchorPosition="downLeft"
                  >
                    {dropdownContent}
                  </EuiPopover>
                </EuiFormRow>
                <EuiFormRow label="Төрөл" fullWidth>
                  <EuiText>{data.category}</EuiText>
                </EuiFormRow>
                <EuiFormRow label="Үүссэн огноо" fullWidth>
                  <EuiText>{formatDate(data.created_at, "dateTime")}</EuiText>
                </EuiFormRow>

                <EuiFormRow label="Шинэчлэгдсэн огноо" fullWidth>
                  <EuiText>{formatDate(data.updated_at, "dateTime")}</EuiText>
                </EuiFormRow>
              </EuiForm>
              <EuiHorizontalRule margin="l" />
              <EuiFlexItem>
                {data.fields.map((field: Field) => {
                  return (
                    <Controller
                      key={`ctrllr__${field.id}`}
                      control={control}
                      name={field.attr_name}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <EuiFormRow
                          key={field.id}
                          label={transformInputLabel(field.attr_name, ticketTemplate)}
                          helpText={field.config?.helpText}
                          fullWidth
                        >
                          {getFieldComponentEdit(field, register, value, onChange, onBlur)}
                        </EuiFormRow>
                      )}
                    />
                  );
                })}
              </EuiFlexItem>
            </EuiPanel> */}
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    </DashboardCRMLayout>
  );
};

export default TicketDetailPage;
