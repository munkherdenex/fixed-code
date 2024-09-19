import {
  EuiButton,
  EuiButtonIcon,
  EuiFieldNumber,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiSelect,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { jsonrepair } from "jsonrepair";
import { useRouter } from "next/router";
import { SetStateAction, useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import * as yup from "yup";
import { CAMPAIGN_CHANNEL_DATA_TYPE_OPTIONS } from "../../constants";
import { Channels } from "../../hooks/useGetChannels";
import useUpdateChannel from "../../hooks/useUpdateChannel";
import { globalMutate } from "../../utils/globalMutate";
import { createChannelSchema } from "./schema";

type FormData = yup.InferType<typeof createChannelSchema>;

const EditChannelFlyot = ({
  setIsFlyoutVisible,
  data,
}: {
  setIsFlyoutVisible: React.Dispatch<SetStateAction<boolean>>;
  data: Channels;
}) => {
  const parsedData = JSON.parse(jsonrepair(data?.data));
  const preparedHeaders =
    parsedData?.headers && Object.keys(parsedData?.headers).length > 0 && parsedData.headers
      ? Object.entries(parsedData.headers).map(([key, value]: [string, any]) => ({
          key,
          value,
        }))
      : undefined;

  const router = useRouter();
  const flyoutHeadingId = useGeneratedHtmlId({
    prefix: "flyoutTitle",
  });
  const { trigger } = useUpdateChannel(router.query.id);

  const {
    handleSubmit,
    control,
    watch,
    resetField,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(createChannelSchema),
    defaultValues: {
      channel_type: data?.channel_type,
      name: data?.name,
      data: {
        host: parsedData?.host || undefined,
        port: parsedData?.port || undefined,
        from_email: parsedData?.from_email || undefined,
        host_user: parsedData?.host_user || undefined,
        host_password: parsedData?.host_password || undefined,
        url: parsedData?.url || undefined,
        headers: preparedHeaders || undefined,
        rate_limit: parsedData?.rate_limit || undefined,
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "data.headers",
  });

  const onSubmit = async (data: FormData) => {
    try {
      const prepared_headers = data?.data?.headers
        ? data?.data?.headers.reduce((a, v) => ({ ...a, [v.key]: v.value }), {})
        : [];

      const response = await trigger({
        ...data,
        data: {
          ...data?.data,
          headers: prepared_headers,
        },
      });
      if (response) {
        globalMutate(`/api/v1/dj/channels/`);
        setIsFlyoutVisible(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    resetField("data");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("channel_type")]);

  return (
    <EuiFlyout onClose={() => setIsFlyoutVisible(false)}>
      <EuiFlyoutHeader hasBorder aria-labelledby={flyoutHeadingId}>
        <EuiTitle>
          <h2>Create channel</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
          <EuiFormRow
            label="Name"
            isInvalid={!!errors.name?.message}
            error={[errors.name?.message]}
          >
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiFieldText
                  onChange={onChange}
                  value={value}
                  onBlur={onBlur}
                  isInvalid={!!errors.name?.message}
                  placeholder="Name"
                  aria-label="name"
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow
            label="Channel type"
            isInvalid={!!errors.channel_type?.message}
            error={[errors.channel_type?.message]}
          >
            <Controller
              control={control}
              name="channel_type"
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiSelect
                  onChange={onChange}
                  value={value}
                  options={CAMPAIGN_CHANNEL_DATA_TYPE_OPTIONS}
                  onBlur={onBlur}
                  isInvalid={!!errors.channel_type?.message}
                  aria-label="channel type"
                />
              )}
            />
          </EuiFormRow>
          {watch("channel_type") === "email" && (
            <>
              <Controller
                control={control}
                name={`data.host`}
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <EuiFormRow label="Host" isInvalid={!!error?.message} error={[error?.message]}>
                    <EuiFieldText
                      onChange={onChange}
                      value={value as string}
                      onBlur={onBlur}
                      isInvalid={!!error?.message}
                      placeholder="host"
                      aria-label="host"
                    />
                  </EuiFormRow>
                )}
              />
              <Controller
                control={control}
                name={`data.port`}
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <EuiFormRow label="Port" isInvalid={!!error?.message} error={[error?.message]}>
                    <EuiFieldNumber
                      onChange={onChange}
                      value={value}
                      onBlur={onBlur}
                      isInvalid={!!error?.message}
                      placeholder="port"
                      aria-label="port"
                    />
                  </EuiFormRow>
                )}
              />
              <Controller
                control={control}
                name={`data.from_email`}
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <EuiFormRow
                    label="From email"
                    isInvalid={!!error?.message}
                    error={[error?.message]}
                  >
                    <EuiFieldText
                      onChange={onChange}
                      value={value}
                      onBlur={onBlur}
                      isInvalid={!!error?.message}
                      placeholder="From email"
                      aria-label="from email"
                    />
                  </EuiFormRow>
                )}
              />
              <Controller
                control={control}
                name={`data.host_user`}
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <EuiFormRow
                    label="Host user"
                    isInvalid={!!error?.message}
                    error={[error?.message]}
                  >
                    <EuiFieldText
                      onChange={onChange}
                      value={value}
                      onBlur={onBlur}
                      isInvalid={!!error?.message}
                      placeholder="Host user"
                      aria-label="host user"
                    />
                  </EuiFormRow>
                )}
              />
              <Controller
                control={control}
                name={`data.host_password`}
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <EuiFormRow
                    label="Host password"
                    isInvalid={!!error?.message}
                    error={[error?.message]}
                  >
                    <EuiFieldText
                      onChange={onChange}
                      value={value}
                      onBlur={onBlur}
                      isInvalid={!!error?.message}
                      placeholder="host password"
                      aria-label="host password"
                    />
                  </EuiFormRow>
                )}
              />
            </>
          )}
          {watch("channel_type") === "api" && (
            <>
              <Controller
                control={control}
                name={`data.url`}
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <EuiFormRow label="Url" isInvalid={!!error?.message} error={[error?.message]}>
                    <EuiFieldText
                      onChange={onChange}
                      value={value as string}
                      onBlur={onBlur}
                      isInvalid={!!error?.message}
                      placeholder="url"
                      aria-label="url"
                    />
                  </EuiFormRow>
                )}
              />
              {fields.map((field, index) => (
                <>
                  <EuiFormRow>
                    <EuiFlexGroup alignItems="center">
                      <EuiFlexItem>
                        <Controller
                          key={field.id}
                          control={control}
                          name={`data.headers.${index}.key`}
                          render={({
                            field: { onChange, onBlur, value },
                            fieldState: { error },
                          }) => (
                            <EuiFormRow
                              label="Key"
                              isInvalid={!!error?.message}
                              error={[error?.message]}
                            >
                              <EuiFieldText
                                onChange={onChange}
                                value={value as string}
                                onBlur={onBlur}
                                isInvalid={!!error?.message}
                                placeholder="key"
                                aria-label="key"
                              />
                            </EuiFormRow>
                          )}
                        />
                      </EuiFlexItem>
                      <EuiFlexItem>
                        <Controller
                          key={field.id}
                          control={control}
                          name={`data.headers.${index}.value`}
                          render={({
                            field: { onChange, onBlur, value },
                            fieldState: { error },
                          }) => (
                            <EuiFormRow
                              label="Value"
                              isInvalid={!!error?.message}
                              error={[error?.message]}
                            >
                              <EuiFieldText
                                onChange={onChange}
                                value={value as string}
                                onBlur={onBlur}
                                isInvalid={!!error?.message}
                                placeholder="value"
                                aria-label="value"
                              />
                            </EuiFormRow>
                          )}
                        />
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiButtonIcon
                          size="m"
                          iconType="cross"
                          type="button"
                          style={{ marginTop: "20px" }}
                          onClick={() => remove(index)}
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiFormRow>
                </>
              ))}
              <Controller
                control={control}
                name={`data.rate_limit`}
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <EuiFormRow
                    label="Rate limit"
                    isInvalid={!!error?.message}
                    error={[error?.message]}
                  >
                    <EuiFieldNumber
                      onChange={onChange}
                      value={value as number}
                      onBlur={onBlur}
                      isInvalid={!!error?.message}
                      placeholder="rate limit"
                      aria-label="rate limit"
                    />
                  </EuiFormRow>
                )}
              />
            </>
          )}
          <EuiFormRow>
            <EuiFlexGroup gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiButton type="submit">Update channel</EuiButton>
              </EuiFlexItem>
              {watch("channel_type") === "api" && (
                <EuiFlexItem grow={false}>
                  <EuiButton
                    type="button"
                    onClick={() =>
                      append({
                        key: "",
                        value: "",
                      })
                    }
                  >
                    Add header
                  </EuiButton>
                </EuiFlexItem>
              )}
            </EuiFlexGroup>
          </EuiFormRow>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default EditChannelFlyot;
