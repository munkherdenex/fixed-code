import {
  EuiButton,
  EuiCallOut,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiIcon,
  EuiSelect,
  EuiTextArea,
  EuiTitle,
  EuiToolTip,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import useCreateTemplate from "../../hooks/useCreateTemplate";
import useGetChannels, { Channels } from "../../hooks/useGetChannels";
import { globalMutate } from "../../utils/globalMutate";
import { isJson } from "../../utils/is_json";
import AceEditorComponent from "./ace_editor";
import { createTemplateFlyoutStyles } from "./create_teamplate_flyout.styles";
import JumpToCreateChannelButton from "./jump_to_create_channel_button";
import QuillEditorComponent from "./quill_editor";

const bodyHelpText = "Use custom attributes to make data dynamic. {{cf_*}}";

const BodyInfoToolTip = () => {
  return (
    <EuiToolTip
      position="bottom"
      content="You need to define the custom fields you plan to use. Common custom fields might include {{email}}, {{phone}}, {{cf_company_name}}, {{cf_email}}, etc."
    >
      <EuiIcon tabIndex={0} type="questionInCircle" title="Icon with tooltip" />
    </EuiToolTip>
  );
};

const schema = yup
  .object({
    title: yup.string().required().label("Title"),
    kind: yup.string().oneOf(["email", "sms", "push", "inapp", "api", ""]).required().label("Data"),
    body: yup.string().required().label("Body"),
    channel: yup.number().required().label("Channel"),
  })
  .required();

const dataTypeOptions = [
  { value: "email", text: "Email" },
  { value: "sms", text: "Sms" },
  { value: "push", text: "Push" },
  { value: "inapp", text: "Inapp" },
  { value: "api", text: "Api" },
];

type FormData = yup.InferType<typeof schema>;

export const dataTypeSwitch = (dataType: FormData["kind"]): FormData["kind"] => {
  switch (dataType) {
    case "sms":
      return "api";
    case "email":
      return "api";
    case "push":
      return "api";
    default:
      return dataType;
  }
};

export const dataTypeToSwitch = (dataType: string) => {
  switch (dataType) {
    case "sms":
      return "phone";
    case "email":
      return "email";
    case "push":
      return "device_id";
    default:
      return dataType;
  }
};

const CreateTemplateFlyot = ({
  closeFlyout,
  dataType,
}: {
  closeFlyout: () => void;
  dataType: FormData["kind"];
}) => {
  const styles = createTemplateFlyoutStyles();
  const router = useRouter();
  const { isMutating, trigger } = useCreateTemplate();
  const { data: channelsData } = useGetChannels<Channels[]>(undefined, {
    all: `${true}`,
  });

  const flyoutHeadingId = useGeneratedHtmlId({
    prefix: "flyoutTitle",
  });

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
    defaultValues: {
      kind: dataType,
    },
  });

  const channelDataOptions = Array.isArray(channelsData)
    ? channelsData
        .filter((channel) => channel.channel_type === dataTypeSwitch(dataType))
        .map((channel) => ({
          value: channel.id,
          text: channel.name,
        }))
    : [];

  const setAceEditorValue = (value: string) => {
    setValue("body", value);
  };

  const setReactQuill = (value: string) => {
    setValue("body", value);
  };

  const onSubmit = async (data: FormData) => {
    if (!isJson(watch("body")) && watch("kind") === "api") {
      setError("body", {
        message: "Invalid json",
        type: "manual",
      });
      return;
    }
    try {
      const preparedData = {
        ...data,
      };
      if (dataType === "email" || dataType === "sms" || dataType === "push") {
        preparedData.kind = "api";
        preparedData.body = JSON.stringify({
          type: "email",
          to: `{{${dataTypeToSwitch(data.kind)}}}`,
          title: data.title,
          body: data.body,
        });
      }

      const response = await trigger(preparedData);
      if (response) {
        globalMutate("/api/v1/dj/templates/");
        closeFlyout();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <EuiFlyout onClose={closeFlyout}>
      <EuiFlyoutHeader hasBorder aria-labelledby={flyoutHeadingId}>
        <EuiTitle>
          <h2>Create {dataType} campaign</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
          {channelDataOptions.length === 0 && (
            <EuiFormRow>
              <EuiCallOut title="Proceed with caution!" color="warning" iconType="warning">
                <p>You need to create a channel before you can create a campaign.</p>
                <EuiButton
                  onClick={() =>
                    router.push("/dashboards/channels", {
                      query: {
                        create: true,
                      },
                    })
                  }
                >
                  Create
                </EuiButton>
              </EuiCallOut>
            </EuiFormRow>
          )}
          <EuiFormRow
            label="Title"
            isInvalid={!!errors.title?.message}
            error={[errors.title?.message]}
          >
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value }, formState: { errors } }) => (
                <EuiFieldText
                  onChange={onChange}
                  value={value}
                  onBlur={onBlur}
                  isInvalid={!!errors.title?.message}
                  placeholder="Title"
                  aria-label="Title"
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow
            label="Data type"
            isInvalid={!!errors.kind?.message}
            error={[errors.kind?.message]}
            style={{ display: "none" }}
          >
            <Controller
              control={control}
              name="kind"
              render={({ field: { onChange, onBlur, value }, formState: { errors } }) => (
                <EuiSelect
                  onChange={onChange}
                  value={value}
                  options={dataTypeOptions}
                  onBlur={onBlur}
                  isInvalid={!!errors.kind?.message}
                  aria-label="data type"
                />
              )}
            />
          </EuiFormRow>
          {watch("kind") === "api" && (
            <EuiFormRow
              label="Data"
              labelAppend={<BodyInfoToolTip />}
              helpText={bodyHelpText}
              isInvalid={!!errors?.body?.message}
              error={[errors?.body?.message]}
            >
              <AceEditorComponent control={control} onChange={setAceEditorValue} />
            </EuiFormRow>
          )}
          {watch("kind") === "sms" && (
            <EuiFormRow
              label="Data"
              labelAppend={<BodyInfoToolTip />}
              helpText={bodyHelpText}
              isInvalid={!!errors?.body?.message}
              error={[errors?.body?.message]}
            >
              <Controller
                control={control}
                name="body"
                render={({ field: { onChange, onBlur, value }, formState: { errors } }) => (
                  <EuiTextArea
                    onChange={onChange}
                    value={value}
                    onBlur={onBlur}
                    isInvalid={!!errors.title?.message}
                    placeholder="Data"
                    aria-label="data"
                  />
                )}
              />
            </EuiFormRow>
          )}
          {watch("kind") === "email" && (
            <EuiFormRow
              label="Data"
              labelAppend={<BodyInfoToolTip />}
              helpText={bodyHelpText}
              isInvalid={!!errors?.body?.message}
              error={[errors?.body?.message]}
              css={styles.quillEditorContainer}
            >
              <QuillEditorComponent control={control} onChange={setReactQuill} />
            </EuiFormRow>
          )}
          <EuiFormRow
            label="Channel"
            isInvalid={!!errors.channel?.message}
            error={[errors.channel?.message]}
          >
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem
                style={
                  channelDataOptions.length === 0
                    ? {
                        display: "none",
                      }
                    : {}
                }
              >
                <Controller
                  control={control}
                  name="channel"
                  render={({ field: { onChange, onBlur, value }, formState: { errors } }) => (
                    <EuiSelect
                      onChange={onChange}
                      value={value}
                      options={channelDataOptions}
                      onBlur={onBlur}
                      isInvalid={!!errors.channel?.message}
                      aria-label="data type"
                      hasNoInitialSelection
                    />
                  )}
                />
              </EuiFlexItem>
              <JumpToCreateChannelButton show={channelDataOptions.length === 0} />
            </EuiFlexGroup>
          </EuiFormRow>
          <EuiButton isLoading={isMutating} type="submit">
            Create campaign
          </EuiButton>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default CreateTemplateFlyot;
