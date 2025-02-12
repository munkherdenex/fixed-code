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
import getFieldComponent from "../../../../../components/ticket_template/utils";
import { useRef, useState } from "react";
import CustomersSelect from "../../../../../components/ticket_template/customers_select";
import ticketTemplateApi from "../../../../../api/ticket_template";

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
  type: "number" | "text"; // Add other possible types
  config: {
    max?: number;
    min?: number;
    step?: number;
    helpText?: string;
    isRequired?: boolean;
    isMultiline?: boolean;
  };
}

interface TicketData {
  id: number;
  fields: Field[];
  category: string;
  created_at: string;
  updated_at: string;
  status: string;
  assigned_to: null | string;
}

const actionButton = (
  <EuiButtonIcon title="Custom action" aria-label="Custom action" color="text" iconType="copy" />
);

const complexEvent = (
  <EuiFlexGroup responsive={false} alignItems="center" gutterSize="xs" wrap>
    <EuiFlexItem grow={false}>added tags</EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiBadge>case</EuiBadge>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiBadge>phising</EuiBadge>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiBadge>security</EuiBadge>
    </EuiFlexItem>
  </EuiFlexGroup>
);

const initialComments: EuiCommentProps[] = [
  {
    username: "Emma",
    timelineAvatar: <EuiAvatar name="emma" />,
    event: "added a comment",
    timestamp: "on 3rd March 2022",
    children: (
      <EuiMarkdownFormat textSize="s">
        Phishing emails have been on the rise since February
      </EuiMarkdownFormat>
    ),
    actions: actionButton,
  },
  {
    username: "watson",
    timelineAvatar: <EuiAvatar name="emma" />,
    event: complexEvent,
    timestamp: "on 3rd March 2022",
    eventIcon: "tag",
    eventIconAriaLabel: "tag",
  },
  {
    username: "system",
    timelineAvatar: "dot",
    timelineAvatarAriaLabel: "System",
    event: "pushed a new incident",
    timestamp: "on 4th March 2022",
    eventColor: "danger",
  },
  {
    username: "Tiago",
    timelineAvatar: <EuiAvatar name="tiago" />,
    event: "added a comment",
    timestamp: "on 4th March 2022",
    actions: actionButton,
    children: (
      <EuiMarkdownFormat textSize="s">
        Take a look at this [Office.exe](http://my-drive.elastic.co/suspicious-file)
      </EuiMarkdownFormat>
    ),
  },
  {
    username: "Liago",
    timelineAvatar: <EuiAvatar name="Liago" />,
    event: (
      <>
        marked case as <EuiBadge color="warning">In progress</EuiBadge>
      </>
    ),
    timestamp: "on 4th March 2022",
  },
];

const replyMsg = `Thanks, Tiago for taking a look. :tada:

I also found something suspicious: [Update.exe](http://my-drive.elastic.co/suspicious-file).
`;

const transformDataToComments = (results): EuiCommentProps[] => {
  return results.map((result) => {
    const { id, type, created_at, created_by, data } = result;

    // Generate a comment message based on the type and changes
    let message = "";
    if (type === "update" && data.changes) {
      const changes = Object.entries(data.changes)
        .map(([key, value]) => `${key}: ${value.old_value}`)
        .join(", ");
      message = `Updated: ${changes}`;
    } else if (type === "open") {
      message = "Ticket opened.";
    }

    return {
      username: `User ${created_by}`,
      event: type,
      timestamp: created_at,
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
  const [comments, setComments] = useState(initialComments);
  const [isLoadingComment, setIsLoadingComment] = useState(false);
  const [editorValue, setEditorValue] = useState(replyMsg);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const { data, error, isLoading } = useSWR(id ? `${id}` : null, ticketApi.getTicketById);
  const { data: ticketLogs } = useSWR(`${id}/logs/`, ticketApi.getLogsByTicketId);
  const {
    data: selectedTicket,
    error: templateError,
    isLoading: isTemplateLoading,
  } = useSWR(
    data?.ticket_template ? `/crm/ticket/${data.ticket_template}/` : null,
    data?.ticket_template ? () => ticketTemplateApi.getTemplateById(data.ticket_template) : null,
  );

  if (!ticketLogs) {
    return <EuiText>No logs found for this ticket.</EuiText>;
  }

  const ticketComments = transformDataToComments(ticketLogs.results);

  if (isLoading) return <div>Loading ticket details...</div>;

  if (error) {
    return (
      <div className="error">
        Error loading ticket: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  if (!data) {
    return <div className="error">Ticket not found</div>;
  }

  const renderField = (field: Field) => {
    switch (field.type) {
      case "number":
        return (
          <EuiFieldNumber
            fullWidth
            value={field.value}
            min={field.config.min}
            max={field.config.max}
            step={field.config.step}
            readOnly // Remove if you want editable fields
          />
        );
      case "text":
        return field.config.isMultiline ? (
          <EuiTextArea fullWidth value={field.value} readOnly resize="vertical" />
        ) : (
          <EuiFieldText fullWidth value={field.value} readOnly />
        );
      default:
        return <EuiText>{field.value}</EuiText>;
    }
  };

  const onAddComment = () => {
    setIsLoadingComment(true);

    const date = formatDate(Date.now(), "dobLong");

    setTimeout(() => {
      setIsLoadingComment(false);
      setEditorValue("");

      setComments([
        ...comments,
        {
          username: "New",
          timelineAvatar: <EuiAvatar name="New Shit" />,
          event: "added a comment",
          timestamp: `on ${date}`,
          actions: actionButton,
          children: <EuiMarkdownFormat textSize="s">{editorValue}</EuiMarkdownFormat>,
        },
      ]);
    }, 3000);
  };

  const commentsList = comments.map((comment, index) => {
    return (
      <EuiComment key={`comment-${index}`} {...comment}>
        {comment.children}
      </EuiComment>
    );
  });

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

                {/* <EuiFormRow>{InilineEditUtils.}</EuiFormRow> */}

                <EuiHorizontalRule margin="l" />
                {/* <EuiSpacer size="xl" /> */}
                <EuiFormRow label="Comments" fullWidth>
                  <EuiCommentList aria-label="Comment system example">
                    {/* <div>{JSON.stringify(ticketLogs, null, 2)}</div> */}
                    <EuiCommentList comments={ticketComments} />
                    {/* {commentsList} */}
                    <EuiComment username="juana" timelineAvatar={<EuiAvatar name="juana" />}>
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
                      <EuiButton onClick={onAddComment} isLoading={isLoading}>
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
                          {getFieldComponent(field, register, value, onChange, onBlur)}
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
