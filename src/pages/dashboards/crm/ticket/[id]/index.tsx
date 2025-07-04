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
  EuiSelectable,
  EuiInputPopover,
  EuiSuperSelect,
  EuiListGroup,
  EuiListGroupItem,
  EuiEmptyPrompt,
  EuiFilePicker,
} from "@elastic/eui";
import DashboardCRMLayout from "../../../../../layouts/dashboard_crm";
import { Controller, useForm } from "react-hook-form";
import getFieldComponentEdit from "../../../../../components/ticket_template/edit_utils";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, useContext } from "react";
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
import ImagePreview from "@/components/image_preview";
import { authContext } from "@/store/auth_store";

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
      event = `Тикет үүссэн`;
      eventColor = "success";
    } else if (type === "assign" || type === "assign_team") {
      event = type === "assign" ? `Assigned worker` : "Assigned team";
      eventColor = "primary";
    } else if (type === "comment") {
      event = `Comment`;
      eventColor = "warning";
      message = body || "";
    } else if (type === "close") {
      event = `Тикет хаасан`;
      eventColor = "danger";
      message = data?.reason || "";
    } else if (type === "update") {
      event = `Тикет update`;
      eventColor = "danger";
      message = data?.reason || "";
    } else {
      message = body || "";
      eventColor = "subdued";
    }

    const comment: EuiCommentProps = {
      // created_by will be an object
      username: `${created_by.email}`,
      event,
      eventColor,
      timestamp: moment(created_at).format("YYYY-MM-DD LT"),
    };

    if (type !== "update" && type !== "open" && type !== "assign" && type !== "assign_team") {
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
  {
    id: "file--id",
    name: "Файл",
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
  const [ticketReOpenDescription, setTicketReOpenDescription] = useState("");
  const [ticketCloseDescription, setTicketCloseDescription] = useState("");
  const [value, setValue] = useState("");
  const [selectedOptions, setSelected] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTicketReOpenModalVisible, setIsTicketReOpenModalVisible] = useState(false);
  const [isTicketCloseModalVisible, setIsTicketCloseModalVisible] = useState(false);
  const [isEditConfirmModalVisible, setIsEditConfirmModalVisible] = useState(false);
  const [isPriorityAdded, setIsPriorityAdded] = useState(false);
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [priorityList, setPriorityList] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedTicketStateType, setSelectedTicketStateType] = useState(null);
  // Form
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [addedTags, setAddedTags] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [needsCallbackValue, setNeedsCallbackValue] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [selectedPriorityDuration, setSelectedPriorityDuration] = useState(null);
  const [files, setFiles] = useState({});
  const [link, setLink] = useState(null);
  const [showFilePopup, setShowFilePopup] = useState(false);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  //
  const errorElementId = useRef(htmlIdGenerator()());
  const modalFormId = useGeneratedHtmlId({ prefix: "modalForm" });
  const reOpenModalFormId = useGeneratedHtmlId({ prefix: "modalForm" });
  const reOpenModalTitleId = useGeneratedHtmlId();
  const modalTitleId = useGeneratedHtmlId();
  const editConfirmModalTitleId = useGeneratedHtmlId();
  const tagSelect = useGeneratedHtmlId();
  const filePickerId = useGeneratedHtmlId({ prefix: "filePicker" });

  const { user } = useContext(authContext);

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
  const { data: ticketFiles, mutate: mutateFiles } = useSWR(`${id}/`, ticketApi.getFilesByTicketId);
  // const {
  //   data: systemTags,
  //   mutate: mutateTags,
  //   error: errorTags,
  // } = useSWR<TagsResponse>("/crm/tag/", () => tagApi.getTags({ limit: 1000 }));

  const { data: teamsList } = useTeams<Teams[]>();

  const {
    data: teamMembers,
    isLoading: isMembersLoading,
    mutateTeamMembers,
  } = useGetCurrentTeamMembers<TeamMembersType>(selectedTeam);

  // const tagsSelectOptions = useMemo(() => {
  //   if (!systemTags?.results) {
  //     return [];
  //   }
  //   return systemTags.results.map((tag: Tag) => ({
  //     value: tag.id,
  //     label: tag.name,
  //   }));
  // }, [systemTags]);

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
      value: member?.user?.email,
      inputDisplay: member?.user?.email,
    }));
  }, [teamMembers]);

  const selectedTabContent = useMemo(() => {
    return tabs.find((obj) => obj.id === selectedTabId)?.content;
  }, [selectedTabId]);

  const ticketStateOptions = [
    {
      value: "openTicket",
      inputDisplay: "Тикет нээх",
      disabled:
        (data && (data.status == "open" || data.status == "processing")) ||
        (user && user.email != data?.created_by.email)
          ? true
          : false,
    },
    {
      value: "ticketProcess",
      inputDisplay: "Тикет шалгаж байгаа",
      disabled: data && (data.status == "processing" || data.status == "close") ? true : false,
    },
    {
      value: "closeTicket",
      inputDisplay: "Тикет хаах",
      disabled: data && data.status == "close" ? true : false,
    },
  ];

  useEffect(() => {
    if (data && data.title && data.title != "") {
      setTicketTitle(data.title);
    } else {
      setTicketTitle("Гарчиг нэмэх...");
    }

    if (data && data.body && data.body != "") {
      setTicketDescription(data.body);
    }

    if (data && data.customer && data.customer.id) {
      setSelectedCustomerId(data.customer.id);
    }

    if (data && data.source && data.source != "") {
      setSelectedChannel(data.source);
    }

    if (data && data.priority) {
      setSelectedPriority(data.priority.id);
      setSelectedPriorityDuration(data.priority.duration + " минут");
      // let obj = priorityList.find((val) => val.id == data.priority.id);
      // if (obj) {
      //   setSelectedPriorityDuration(obj.duration + " минут");
      // }
    }

    if (data && data.needs_callback) {
      setNeedsCallbackValue(data.needs_callback);
    }

    if (data && data.assigned_team_id && !selectedTeamId) {
      setSelectedTeamId(data.assigned_team_id);
      let team = teamsList.find((el) => el.id == data.assigned_team_id);
      setSelectedTeam(team || null);
    }

    if (data && data.assigned_to && !selectedMember) {
      let member = teamMembers?.members.find((el) => el.id == data.assigned_to);
      setSelectedMember(member?.user?.email);
    }
    // TODO: SET ALL OTHER VALUE HERE
  }, [data, teamsList, teamMembers, selectedTeamId, selectedMember]);

  useEffect(() => {
    if (data && data.priority) {
      addPriority();
    }
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
      mutateLogs();
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

  const closeTicketReOpenModal = () => {
    setIsTicketReOpenModalVisible(false);
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
      if (data.priority == null) {
        onChangePriority(results[0]);
      }
    } catch (error) {
      console.error("Failed to update ticket:", error);
    }
  };

  const onChangePriority = (e) => {
    console.log("on change priority");
    let element = e.target ? e.target : e;
    setSelectedPriority(element.value ? element.value : element.id);
    let obj;
    if (priorityList) {
      obj = priorityList.find((val) => val.id == element.value);
    }
    setSelectedPriorityDuration((obj ? obj.duration : e.duration) + " минут");
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

  const removeTag = async (tagId) => {
    await ticketApi.removeTagFromTicket(id, tagId);
    await mutatePage();
    // const updatedTags = addedTags.filter((tag) => tag.value != id);
    // setAddedTags(updatedTags);
  };

  const handleTagAdd = () => {
    const selectedId = selectedTag;
    console.log(selectedId);
    if (!selectedId) {
      setSelectedTag(null);
      return;
    }
    const foundTag = tagsSelectOptions.find((tag) => tag.value == selectedId);
    let arr = addedTags;
    arr.push(foundTag);
    setAddedTags(arr || []);
    // setIsTagAddPopoverOpen(false);
  };

  const onTeamChange = (e) => {
    setSelectedMember(null);
    setSelectedTeamId(e.target.value);
    let team = teamsList.find((el) => el.id == e.target.value);
    setSelectedTeam(team || null);
    // mutateTeamMembers();
  };

  const onFileChange = (files) => {
    setFiles(files.length > 0 ? Array.from(files) : []);
  };

  const onPostFile = async () => {
    try {
      setFileUploadLoading(true);
      const formData = new FormData();
      formData.append("file", files[0], files[0].name);
      let res = await ticketApi.postFileOnTicket(id, formData);
      setFileUploadLoading(false);
      setFiles({});
      mutateFiles();
    } catch (e) {
      setFileUploadLoading(false);
      console.log(e);
    }
  };

  const downloadFile = async (el) => {
    try {
      let res = await ticketApi.getFileById(el.id);
      const link = document.createElement("a");
      setLink(res.file_url);
      console.log(res.file_url);
      setShowFilePopup(true);
      // link.href = res.file_url;
      // document.body.appendChild(link);
      // link.click();
      // link.parentNode?.removeChild(link);
    } catch (e) {
      console.log(e);
    }
  };

  const onTeamMemberChange = (value) => {
    setSelectedMember(value);
  };

  const changeTicketStatus = async (status) => {
    try {
      let payload = {
        status: status === "close" ? "close" : status === "processing" ? "processing" : "open",
        ...(status === "close" || status === "open"
          ? { reason: status === "close" ? ticketCloseDescription : ticketReOpenDescription }
          : {}),
      };
      await ticketApi.changeStatus(id, payload);
      mutatePage();
      mutateLogs();
      setIsTicketCloseModalVisible(false);
      setIsTicketReOpenModalVisible(false);
      // router.push("/dashboards/crm/ticket?pageIndex=1&pageSize=10");
    } catch (error) {
      console.error("Failed to update ticket:", error);
    }
  };

  const editTicket = async () => {
    try {
      let payload = {
        ...(ticketDescription != "" && { body: ticketDescription }),
        ...(addedTags.length > 0 && { tags: addedTags }),
        ...(selectedCustomerId && { customer_id: parseInt(selectedCustomerId) }),
        // ...(selectedChannel && { channel: selectedChannel }),
        ...(needsCallbackValue && { needs_callback: needsCallbackValue == "true" ? true : false }),
        ...(selectedTeamId && { assigned_team_id: parseInt(selectedTeamId) }),
        ...(selectedMember && { at_email: selectedMember }),
        ...(selectedPriority && { priority_id: parseInt(selectedPriority) }),
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

  const onTicketStateChange = (value) => {
    setSelectedTicketStateType(value);
    if (value == "closeTicket") {
      setIsTicketCloseModalVisible(true);
    }
    if (value == "openTicket") {
      setIsTicketReOpenModalVisible(true);
    }
    if (value == "ticketProcess") {
      changeTicketStatus("processing");
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
      <EuiButtonEmpty
        iconType="plusInCircle"
        color="primary"
        onClick={onTagAddButtonClick}
        disabled={data?.status == "close" ? true : false}
      >
        Төрөл нэмэх
      </EuiButtonEmpty>
    </>
  );

  const HeaderChildren = () => {
    return (
      <>
        <EuiBadge color="hollow">{"Тикет: #" + data?.id}</EuiBadge>
        <EuiBadge
          color={
            data?.status == "open" ? "success" : data?.status == "processing" ? "warning" : "danger"
          }
          iconType="dot"
        >
          {data?.status == "open"
            ? "Нээлттэй"
            : data?.status == "processing"
              ? "Шалгагдаж байгаа"
              : "Хаалттай"}
        </EuiBadge>
      </>
    );
  };

  const SelectableInputPopover = ({ emitTagChange }) => {
    const router = useRouter();
    const { id } = router.query;
    const [selectedTag, setSelectedTag] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isSearching, setIsSearching] = useState(true);

    const handleSaveTag = async (value) => {
      const newTag = {
        tag_id: value,
      };
      await ticketApi.addTagToTicket(id, newTag);
      setSelectedTag(null);
      emitTagChange(true);
    };

    const {
      data: systemTags,
      mutate: mutateTags,
      error: errorTags,
    } = useSWR<TagsResponse>("/crm/tag/", () => tagApi.getTags({ limit: 1000 }));

    const tagsSelectOptions = useMemo(() => {
      if (!systemTags?.results) {
        return [];
      }
      return systemTags.results.map((tag: Tag) => ({
        value: tag.id,
        label: tag.name,
      }));
    }, [systemTags]);

    return (
      <EuiSelectable
        aria-label="Selectable + input popover example"
        options={tagsSelectOptions}
        onChange={async (newOptions, event, changedOption) => {
          await handleSaveTag(changedOption.value);
          setSelectedTag(changedOption.value);
          setIsOpen(false);
          if (changedOption.checked === "on") {
            setInputValue(changedOption.label);
            setIsSearching(false);
          } else {
            setInputValue("");
          }
        }}
        singleSelection
        searchable
        searchProps={{
          value: inputValue,
          onChange: (value) => {
            setInputValue(value);
            setIsSearching(true);
          },
          onKeyDown: (event) => {
            if (event.key === "Tab") return setIsOpen(false);
            if (event.key !== "Escape") return setIsOpen(true);
          },
          onClick: () => setIsOpen(true),
          onFocus: () => setIsOpen(true),
        }}
        isPreFiltered={isSearching ? false : { highlightSearch: false }} // Shows the full list when not actively typing to search
        listProps={{
          css: { ".euiSelectableList__list": { maxBlockSize: 200 } },
        }}
      >
        {(list, search) => (
          <EuiInputPopover
            closePopover={() => setIsOpen(false)}
            disableFocusTrap
            closeOnScroll
            isOpen={isOpen}
            input={search!}
            panelPaddingSize="none"
          >
            {list}
          </EuiInputPopover>
        )}
      </EuiSelectable>
    );
  };

  const renderTabs = () => {
    return tabs.map((tab, index) => (
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
    ));
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
        // <EuiButton
        //   fill
        //   key="test value"
        //   iconType="crossInCircle"
        //   color="text"
        //   onClick={() => {
        //     setIsTicketCloseModalVisible(true);
        //   }}
        // >
        //   Тикет хаах
        // </EuiButton>
        <EuiSuperSelect
          options={ticketStateOptions}
          placeholder="Төлөв өөрчлөх"
          onChange={(value) => onTicketStateChange(value)}
          itemLayoutAlign="top"
          hasDividers
        />
      }
    >
      <>
        {isTicketReOpenModalVisible && (
          <EuiModal aria-labelledby={reOpenModalTitleId} onClose={closeTicketReOpenModal}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>Тикет нээх</EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
              <strong>Тайлбар</strong>
              <EuiTextArea
                placeholder="Тикет нээх болсон шалтгаанаа бичнэ үү."
                aria-label="Ticket reopen description area"
                value={ticketReOpenDescription}
                onChange={(e) => setTicketReOpenDescription(e.target.value)}
              />
            </EuiModalBody>

            <EuiModalFooter>
              <EuiButtonEmpty onClick={closeTicketReOpenModal}>Болих</EuiButtonEmpty>
              <EuiButton
                type="submit"
                form={reOpenModalFormId}
                onClick={() => changeTicketStatus("open")}
                fill
              >
                Нээх
              </EuiButton>
            </EuiModalFooter>
          </EuiModal>
        )}
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
              <EuiButton
                type="submit"
                form={modalFormId}
                onClick={() => changeTicketStatus("close")}
                fill
              >
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
          <EuiFlexItem
            style={data?.status === "close" ? { pointerEvents: "none", opacity: 0.5 } : {}}
          >
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
                    disabled={data?.status == "close" ? true : false}
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
                    <EuiFlexItem grow={false}>
                      {
                        data?.tags.length > 0 ? (
                          <EuiFlexGrid columns={3} gutterSize="s">
                            {data?.tags.map((tag) => (
                              <EuiFlexItem grow={false} key={tag.value}>
                                <EuiBadge
                                  iconSide="right"
                                  iconType="cross"
                                  iconOnClick={() => {
                                    removeTag(tag.id);
                                  }}
                                  color={tag.color}
                                >
                                  {tag.name}
                                </EuiBadge>
                              </EuiFlexItem>
                            ))}
                          </EuiFlexGrid>
                        ) : null
                        // <>
                        //   <EuiFlexGroup justifyContent="flexStart" alignItems="flexStart">
                        //     <EuiFlexItem grow={false}>
                        //       <EuiFlexGroup wrap responsive={false} gutterSize="xs">
                        //         {data?.tags.map((tag) => (
                        //           <EuiFlexItem grow={false} key={tag.id}>
                        //             <EuiBadge color={tag.color}>{tag.name}</EuiBadge>
                        //           </EuiFlexItem>
                        //         ))}
                        //       </EuiFlexGroup>
                        //     </EuiFlexItem>
                        //   </EuiFlexGroup>
                        //   <EuiSpacer size="m" />
                        // </>
                      }
                    </EuiFlexItem>

                    <EuiFlexItem grow={false}>
                      <EuiPopover
                        button={tagAddButton}
                        isOpen={isTagAddPopoverOpen}
                        closePopover={closeTagAddPopover}
                      >
                        <EuiFormRow label="Tag Color">
                          <SelectableInputPopover
                            emitTagChange={async () => {
                              setIsTagAddPopoverOpen(false);
                              await mutatePage();
                            }}
                          />
                        </EuiFormRow>
                      </EuiPopover>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                  <EuiSpacer size="m" />
                  {/* <TagsManager /> */}
                  {/* {data?.tags.length > 0 ? (
                    <>
                      <EuiFlexGroup justifyContent="flexStart" alignItems="flexStart">
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
                  ) : null} */}
                  {/* Хэрэглэгчийн мэдээлэл */}
                  <EuiFlexItem grow={false}>
                    <div>
                      <span style={{ color: "red" }}>*</span>
                      <strong>Хэрэглэгчийн мэдээлэл</strong>
                    </div>
                  </EuiFlexItem>
                  <EuiSpacer size="xs" />
                  <CustomersSelect
                    onSelect={onCustomerSelect}
                    initValue={selectedCustomerId}
                    isDisabled={data?.status == "close" ? true : false}
                  />
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
                  <EuiFieldText
                    type="search"
                    controlOnly
                    value={selectedChannel}
                    aria-label="Selected source duration value"
                    disabled={true}
                    readOnly={true}
                    fullWidth={true}
                  />
                  {/* <EuiSelect
                    hasNoInitialSelection
                    fullWidth={true}
                    options={contactedChannelOptions}
                    value={selectedChannel}
                    onChange={(e) => {
                      setSelectedChannel(e.target.value);
                    }}
                    aria-label="Use aria labels when no actual label is in use"
                  /> */}
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
                    disabled={data?.status == "close" ? true : false}
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
                    disabled={data?.status == "close" ? true : false}
                  />
                  {/* Хариуцах ажилтан */}
                  {selectedTeamId && selectedTeam ? (
                    <>
                      <EuiSpacer size="m" />
                      <EuiFlexItem grow={false}>
                        <div>
                          <strong>Хариуцах ажилтан</strong>
                        </div>
                      </EuiFlexItem>
                      <EuiSpacer size="xs" />
                      <EuiSuperSelect
                        fullWidth={true}
                        options={teamsMembersSelectionOptions}
                        valueOfSelected={selectedMember}
                        onChange={(e) => {
                          onTeamMemberChange(e);
                        }}
                        aria-label="Use aria labels when no actual label is in use"
                        disabled={data?.status == "close" ? true : false}
                      />
                    </>
                  ) : null}
                  {/* Чухлын зэрэг */}
                  {data?.has_priority || data?.priority ? (
                    <>
                      {!isPriorityAdded && !data?.priority ? (
                        <>
                          <EuiSpacer size="m" />
                          <EuiFlexGroup justifyContent="flexEnd">
                            <EuiButtonEmpty
                              size="s"
                              onClick={addPriority}
                              iconType="plusInCircle"
                              disabled={data?.status == "close" ? true : false}
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
                            disabled={data?.status == "close" ? true : false}
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
                      disabled={data?.status == "close" ? true : false}
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
                    <EuiFlexItem
                      style={
                        data?.status === "close" ? { pointerEvents: "none", opacity: 0.5 } : {}
                      }
                    >
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
              <EuiTabs>{renderTabs()}</EuiTabs>
              {/* Comment/Logs */}
              {selectedTabId == "cobalt--id" ? (
                <>
                  <EuiSpacer size="m" />
                  <EuiFormRow
                    fullWidth
                    style={data?.status === "close" ? { pointerEvents: "none", opacity: 0.5 } : {}}
                  >
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
                  <EuiFlexGroup justifyContent="flexEnd" responsive={false}>
                    <EuiFlexItem grow={false}>
                      <div>
                        <EuiButton
                          onClick={onAddComment}
                          isLoading={isLoading}
                          aria-label="comment Add"
                          isDisabled={editorValue == ""}
                        >
                          Add comment
                        </EuiButton>
                      </div>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </>
              ) : (
                // Files
                <>
                  <EuiSpacer size="s" />
                  <EuiFlexGroup justifyContent="center" responsive={false}>
                    <EuiFlexItem grow={true}>
                      <EuiFilePicker
                        id={filePickerId}
                        multiple
                        initialPromptText="Select or drag and drop multiple files"
                        onChange={onFileChange}
                        fullWidth={true}
                        aria-label="Use aria labels when no actual label is in use"
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                  <EuiSpacer size="s" />
                  <EuiFlexGroup justifyContent="flexStart" responsive={false}>
                    <EuiFlexItem grow={true}>
                      <EuiButton
                        onClick={onPostFile}
                        isLoading={fileUploadLoading}
                        aria-label="comment Add"
                        isDisabled={!files || files.length == 0}
                      >
                        Хадгалах
                      </EuiButton>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                  <EuiSpacer size="m" />
                  <EuiHorizontalRule size="full" margin="none" />
                  {showFilePopup ? (
                    <ImagePreview
                      fileUrl={link}
                      altText="Preview image"
                      closePopup={() => {
                        setShowFilePopup(false);
                      }}
                    />
                  ) : null}
                  {ticketFiles?.results.length > 0 ? (
                    <EuiListGroup>
                      <EuiSpacer size="xs" />
                      <EuiText grow={false}>
                        <p>Файлын жагсаалт: </p>
                      </EuiText>
                      {ticketFiles?.results.map((e, idx) => (
                        <EuiListGroupItem
                          key={e.id}
                          onClick={() => downloadFile(e)}
                          label={`#${idx + 1}: ` + e.file_name}
                        />
                      ))}
                    </EuiListGroup>
                  ) : (
                    <EuiFlexGroup>
                      <EuiFlexItem>
                        <EuiEmptyPrompt
                          iconType="list"
                          title={<h2>Файл олдсонгүй</h2>}
                          body={<p>Хэрэглэгч файл хавсаргаагүй байна</p>}
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  )}
                </>
              )}
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
