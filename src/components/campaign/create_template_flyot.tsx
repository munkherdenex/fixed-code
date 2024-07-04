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
import useGetChannels, { ChannelsResponse } from "../../hooks/useGetChannels";
import { globalMutate } from "../../utils/globalMutate";
import { isJson } from "../../utils/is_json";
import AceEditorComponent from "./ace_editor";
import JumpToCreateChannelButton from "./jump_to_create_channel_button";

const schema = yup
  .object({
    title: yup.string().required(),
    kind: yup.string().oneOf(["email", "sms", "push", "inapp", "api"]).required(),
    body: yup.string().required(),
    channel: yup.number().required(),
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
  const { data: channelsData } = useGetChannels<ChannelsResponse>();

  const flyoutHeadingId = useGeneratedHtmlId({
    prefix: "flyoutTitle",
  });

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      kind: "api",
    },
  });

  const channelDataOptions = Array.isArray(channelsData?.results)
    ? channelsData?.results
        .filter((channel) => channel.channel_type === watch("kind"))
        .map((channel) => ({
          value: channel.id,
          text: channel.name,
        }))
    : [];

  const setAceEditorValue = (value: string) => {
    setValue("body", value);
  };

  const onSubmit = async (data: FormData) => {
    if (isJson(watch("body"))) {
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
          <h2>Create send</h2>
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
              isInvalid={!!errors?.body?.message || isJson(watch("body"))}
              error={[
                errors?.body?.message
                  ? errors?.body?.message
                  : isJson(watch("body"))
                  ? "Invalid json"
                  : "",
              ]}
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
          <EuiFormRow
            label="Channel"
            isInvalid={!!errors.channel?.message}
            error={[errors.channel?.message]}
          >
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem>
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
            Create send
          </EuiButton>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default CreateTemplateFlyot;
