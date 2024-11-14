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
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { CAMPAIGN_CHANNEL_DATA_TYPE_OPTIONS, IS_POCKET } from "../../constants";
import useGetChannels, { Channels } from "../../hooks/useGetChannels";
import { Template } from "../../hooks/useGetTemplates";
import useUpdateTemplate from "../../hooks/useUpdateTemplate";
import { globalMutate } from "../../utils/globalMutate";
import { dataTypeSwitch, dataTypeToSwitch, processBody, processKind } from "../../utils/helper";
import { isJson } from "../../utils/is_json";
import { quillEditorStyles } from "../email_editor/quill_editor.styles";
import AceEditorComponent from "./ace_editor";
import JumpToCreateChannelButton from "./jump_to_create_channel_button";
const QuillEditorComponent = dynamic(() => import("../email_editor/quill_editor"), { ssr: false });

const schema = yup
  .object({
    title: yup.string().required().label("Title"),
    kind: yup.string().oneOf(["email", "sms", "push", "inapp", "api"]).required().label("Data"),
    body: yup
      .string()
      .required()
      .label("Body")
      .when(["kind"], ([kind], schema) => {
        if (kind === "sms" || kind === "push") return schema.max(160, "Max 160 characters");
        return schema;
      }),
    channel: yup.number().required().label("Channel"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const EditTemplateFlyout = ({ closeFlyout, data }: { closeFlyout: () => void; data: Template }) => {
  const router = useRouter();
  const { isMutating, trigger } = useUpdateTemplate(router.query.id);
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
    resolver: yupResolver(schema),
    defaultValues: {
      kind: processKind(data?.body, data?.kind),
      body: processBody(data?.body, processKind(data?.body, data?.kind)),
      title: data?.title,
      channel: data?.channel,
    },
  });

  const styles = quillEditorStyles();

  const channelDataOptions = Array.isArray(channelsData)
    ? channelsData
        .filter(
          (channel) => channel.channel_type === dataTypeSwitch(processKind(data?.body, data?.kind)),
        )
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

      const dataType = processKind(data?.body, data?.kind);

      if ((dataType === "sms" || dataType === "push") && IS_POCKET) {
        preparedData.kind = "api";
        preparedData.body = JSON.stringify({
          type: dataType,
          to: `{{${dataTypeToSwitch(data?.kind)}}}`,
          title: data?.title,
          body: data?.body,
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
          <h2>Update campaign</h2>
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
                  options={CAMPAIGN_CHANNEL_DATA_TYPE_OPTIONS}
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
          {(watch("kind") === "sms" || watch("kind") === "push") && (
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
            Update campaign
          </EuiButton>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default EditTemplateFlyout;
