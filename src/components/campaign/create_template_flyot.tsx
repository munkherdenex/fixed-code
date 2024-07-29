import {
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiSelect,
  EuiTextArea,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import useCreateTemplate from "../../hooks/useCreateTemplate";
import useGetChannels, { Channels } from "../../hooks/useGetChannels";
import { globalMutate } from "../../utils/globalMutate";
import { isJson } from "../../utils/is_json";
import AceEditorComponent from "./ace_editor";
import JumpToCreateChannelButton from "./jump_to_create_channel_button";
import QuillEditorComponent from "./quill_editor";

const schema = yup
  .object({
    title: yup.string().required().label("Title"),
    kind: yup.string().oneOf(["email", "sms", "push", "inapp", "api"]).required().label("Data"),
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

const CreateTemplateFlyot = ({ closeFlyout }: { closeFlyout: () => void }) => {
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
      kind: "api",
    },
  });

  const channelDataOptions = Array.isArray(channelsData)
    ? channelsData
      .filter((channel) => channel.channel_type === watch("kind"))
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
      const response = await trigger(data);
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
          <h2>Create campaign</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
          <EuiFormRow
            label="Title"
            isInvalid={!!errors.title?.message}
            error={[errors.title?.message]}
          >
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
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
          >
            <Controller
              control={control}
              name="kind"
              render={({ field: { onChange, onBlur, value } }) => (
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
              helpText="Use custom attributes to make data dynamic. {{custom_attribute}}"
              isInvalid={!!errors?.body?.message}
              error={[errors?.body?.message]}
            >
              <AceEditorComponent control={control} onChange={setAceEditorValue} />
            </EuiFormRow>
          )}
          {watch("kind") === "sms" && (
            <EuiFormRow
              label="Data"
              helpText="Use custom attributes to make data dynamic. {{custom_attribute}}"
              isInvalid={!!errors?.body?.message}
              error={[errors?.body?.message]}
            >
              <Controller
                control={control}
                name="body"
                render={({ field: { onChange, onBlur, value } }) => (
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
              helpText="..."
              isInvalid={!!errors?.body?.message}
              error={[errors?.body?.message]}
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
                  render={({ field: { onChange, onBlur, value } }) => (
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
