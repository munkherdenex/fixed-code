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
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiPanel,
  EuiPopover,
  EuiSpacer,
  EuiSwitch,
  EuiText,
  EuiTextArea,
  EuiTitle,
  formatDate,
  htmlIdGenerator,
  useGeneratedHtmlId,
} from "@elastic/eui";
import DashboardCRMLayout from "../../../../../layouts/dashboard_crm";
import { Controller, useForm } from "react-hook-form";
import getFieldComponentEdit from "../../../../../components/ticket_template/edit_utils";
import { useCallback, useEffect, useRef, useState } from "react";
import ticketTemplateApi from "../../../../../api/ticket_template";
import moment from "moment";
import WorkersSelect from "../../../../../components/ticket_template/worker_select";
import TagsManager from "../../../../../components/ticket_template/tags";

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

const transformInputLabel = (attrName, template: any): string => {
  if (template) {
    const field = template?.fields.find((field) => field.attr_name === attrName);
    return field ? field.name : "";
  }
  return "";
};

const transformDataToComments = (results: Result[], ticketTemplate: any): EuiCommentProps[] => {
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
            return `"${fieldName}" changed from "${value.old_value && value.old_value.value ? value.old_value.value + " " + value.old_value.emoji : value.old_value}"`;
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

const TicketDetailPage = ({ params }: { params: { id: string } }) => {
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [value, setValue] = useState("");
  const [selectedOptions, setSelected] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const errorElementId = useRef(htmlIdGenerator()());
  const modalFormId = useGeneratedHtmlId({ prefix: "modalForm" });
  const modalTitleId = useGeneratedHtmlId();
  const router = useRouter();
  const { id } = router.query;
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
  const { data: ticketLogs, mutate } = useSWR(`${id}/logs/`, ticketApi.getLogsByTicketId);
  const { data: ticketTemplate } = useSWR(
    data?.ticket_template ? `/crm/ticket/${data.ticket_template}/` : null,
    data?.ticket_template ? () => ticketTemplateApi.getTemplateById(data.ticket_template) : null,
  );

  useEffect(() => {
    if (data && data.title && data.title != "") {
      setTicketTitle(data.title);
    } else {
      setTicketTitle("Гарчиг нэмэх...");
    }

    if (data && data.body && data.body != "") {
      setTicketDescription(data.body);
    } else {
      setTicketDescription("Тайлбар нэмэх...");
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

  const onAddComment = async (comment: string) => {
    try {
      await ticketApi.postCommentOnTicket(id, { comment: editorValue });
      mutate();
      setEditorValue("");
    } catch (err) {
      console.error("Failed to submit comment:", err);
    }
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

  return (
    <DashboardCRMLayout>
      <>
        <EuiFlexGroup>
          <EuiFlexItem grow={2}>
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
              {/* Ticket name and description will be added */}
              {/* Ticket Id haruulna: #47*/}
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
              <TagsManager />
              {/* <EuiTitle size="l">
                <h1>{data ? ticketTemplate.title : ""}</h1>
              </EuiTitle>
              <EuiTitle size="s">
                <div>{ticketTemplate ? ticketTemplate.description : ""}</div>
              </EuiTitle> */}
              <EuiForm component="div">
                <EuiHorizontalRule margin="l" />
                <EuiFormRow label="Comments" fullWidth>
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
                        onClick={() => onAddComment}
                        isLoading={isLoading}
                        aria-label="comment Add"
                        isDisabled={editorValue == ""}
                      >
                        Add comment
                      </EuiButton>
                    </div>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiForm>
            </EuiPanel>
          </EuiFlexItem>

          {/* Right-Side */}
          <EuiFlexItem>
            <EuiPanel paddingSize="l">
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
                {/* Label mongoloor */}
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
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    </DashboardCRMLayout>
  );
};

export default TicketDetailPage;
