import useSWR from "swr";
import { useRouter } from "next/router";
import ticketApi from "../../../../../api/ticket";
import {
  EuiAvatar,
  EuiBadge,
  EuiButton,
  EuiButtonIcon,
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
  EuiMarkdownEditor,
  EuiMarkdownFormat,
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiPanel,
  EuiSpacer,
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
import { useRef, useState } from "react";
import CustomersSelect from "../../../../../components/ticket_template/customers_select";
import ticketTemplateApi from "../../../../../api/ticket_template";
import moment from "moment";

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

const transformDataToComments = (results: Result[]): EuiCommentProps[] => {
  return results.map((result) => {
    const { id, body, type, created_at, created_by, data } = result;

    let message = "";
    let event = "";
    let eventColor: "subdued" | "primary" | "success" | "danger" | "warning" | undefined;

    if (type === "update" && data.changes) {
      const changes = Object.entries(data.changes)
        .map(([key, value]) => `${key}: ${value.old_value}`)
        .join(", ");
      message = `Updated: ${changes}`;
      event = "Update";
      eventColor = "warning";
    } else if (type === "open") {
      message = "Ticket opened.";
      event = "Open";
      eventColor = "success";
    } else {
      message = body || "";
      event = "Comment";
      eventColor = "subdued";
    }

    return {
      username: `User ${created_by}`,
      event,
      eventColor,
      timestamp: moment(created_at).format("YYYY/MM/DD HH:SS"),
      children: <p>{message}</p>,
    };
  });
};

const TicketDetailPage = ({ params }: { params: { id: string } }) => {
  const errorElementId = useRef(htmlIdGenerator()());
  const flyoutId = useGeneratedHtmlId();
  const router = useRouter();
  const { id } = router.query;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();
  const [comments, setComments] = useState([]);
  const [editorValue, setEditorValue] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const { data, error, isLoading } = useSWR(id ? `${id}` : null, ticketApi.getTicketById);
  const { data: ticketLogs, mutate } = useSWR(`${id}/logs/`, ticketApi.getLogsByTicketId);
  // useSWR(
  //   data?.ticket_template ? `/crm/ticket/${data.ticket_template}/` : null,
  //   data?.ticket_template ? () => ticketTemplateApi.getTemplateById(data.ticket_template) : null,
  // );

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
    ticketLogs.results.sort((a, b) => {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }),
  );

  // const renderField = (field: Field) => {
  //   switch (field.type) {
  //     case "number":
  //       return (
  //         <EuiFieldNumber
  //           fullWidth
  //           value={field.value}
  //           min={field.config.min}
  //           max={field.config.max}
  //           step={field.config.step}
  //           readOnly // Remove if you want editable fields
  //         />
  //       );
  //     case "text":
  //       return field.config.isMultiline ? (
  //         <EuiTextArea fullWidth value={field.value} readOnly resize="vertical" />
  //       ) : (
  //         <EuiFieldText fullWidth value={field.value} readOnly />
  //       );
  //     default:
  //       return <EuiText>{field.value}</EuiText>;
  //   }
  // };

  const onAddComment = async (comment: string) => {
    try {
      await ticketApi.postCommentOnTicket(id, { comment: editorValue });
      mutate();
      setEditorValue("");
    } catch (err) {
      console.error("Failed to submit comment:", err);
    }
  };

  // const commentsList = comments.map((comment, index) => {
  //   return (
  //     <EuiComment key={`comment-${index}`} {...comment}>
  //       {comment.children}
  //     </EuiComment>
  //   );
  // });

  const handleCustomerSelect = (selectedValue: string) => {
    console.log("Selected Value:", selectedValue);
    setSelectedCustomerId(selectedValue);
  };

  return (
    <DashboardCRMLayout>
      <>
        <EuiFlexGroup>
          <EuiFlexItem grow={2}>
            <EuiPanel paddingSize="l">
              <EuiBadge color="default">Status: {data.status.toUpperCase()}</EuiBadge>
              <EuiSpacer size="s" />
              <EuiForm component="div">
                <EuiFormRow label="Category" fullWidth>
                  <EuiText>{data.category}</EuiText>
                </EuiFormRow>
                <EuiFormRow label="Created At" fullWidth>
                  <EuiText>{formatDate(data.created_at, "dateTime")}</EuiText>
                </EuiFormRow>

                <EuiFormRow label="Last Updated At" fullWidth>
                  <EuiText>{formatDate(data.updated_at, "dateTime")}</EuiText>
                </EuiFormRow>

                <EuiHorizontalRule margin="l" />
                {/* <EuiSpacer size="xl" /> */}
                <EuiFormRow label="Comments" fullWidth>
                  <EuiCommentList comments={ticketComments} aria-label="Comment system example">
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
              </EuiForm>
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiPanel paddingSize="l">
              <EuiFlexGroup direction="row">
                <EuiFlexItem>
                  <CustomersSelect
                    isLoading={false}
                    isDisabled={false}
                    onSelect={handleCustomerSelect}
                  />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton isDisabled={!selectedCustomerId}>Assign</EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiSpacer size="m"></EuiSpacer>
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
                          label={field.attr_name}
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
