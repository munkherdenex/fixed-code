import {
  EuiFlyout,
  EuiFlyoutHeader,
  EuiTitle,
  EuiFlyoutBody,
  EuiForm,
  EuiFormRow,
  EuiSelect,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { IS_POCKET } from "../../constants";
import useGetChannels, { Channels } from "../../hooks/useGetChannels";
import useUpdateTemplate from "../../hooks/useUpdateTemplate";
import { useCampaignContext } from "../../store/campaign_store";
import { globalMutate } from "../../utils/globalMutate";
import { processKind, processBody, dataTypeSwitch, dataTypeToSwitch } from "../../utils/helper";
import { isJson } from "../../utils/is_json";
import JumpToCreateChannelButton from "./jump_to_create_channel_button";

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

const ChangeChannelFlyout = ({ closeFlyout }: { closeFlyout: () => void }) => {
  const router = useRouter();
  const { data } = useCampaignContext();
  const { isMutating, trigger } = useUpdateTemplate(router.query.id);
  const { data: channelsData, isLoading } = useGetChannels<Channels[]>(undefined, {
    all: `${true}`,
  });

  const flyoutHeadingId = useGeneratedHtmlId({
    prefix: "flyoutTitle",
  });

  const {
    handleSubmit,
    control,
    watch,
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

  const channelDataOptions = Array.isArray(channelsData)
    ? channelsData
        .filter(
          (channel) =>
            channel?.channel_type === dataTypeSwitch(processKind(data?.body, data?.kind)),
        )
        .map((channel) => ({
          value: channel?.id,
          text: channel?.name,
        }))
    : [];

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
          <h2>Change channel</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        {isLoading && <div>Loading...</div>}
        {!isLoading && (
          <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
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
            <EuiButton isLoading={isMutating} disabled={isMutating} type="submit">
              Change channel
            </EuiButton>
          </EuiForm>
        )}
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default ChangeChannelFlyout;
