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
  EuiSwitch,
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
import { useTranslations } from "next-intl";

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
  const translate = useTranslations();

  const flyoutHeadingId = useGeneratedHtmlId({
    prefix: "flyoutTitle",
  });
  const { trigger, isMutating } = useUpdateChannel(router.query.id);

  const {
    handleSubmit,
    control,
    watch,
    resetField,
    formState: { errors },
  } = useForm({
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
      const preparedSecure = data?.data?.headers
        ? data?.data?.headers.reduce((a, v) => ({ ...a, [v.key]: v.secure }), {})
        : {};

      const response = await trigger({
        ...data,
        data: {
          ...data?.data,
          headers: prepared_headers,
          secure: preparedSecure,
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
            label={translate("name")}
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
                  placeholder={translate("name")}
                  aria-label={translate("name")}
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow
            label={translate("channel_type")}
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
                  aria-label={translate("channel_type")}
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
                  <EuiFormRow
                    label={translate("host")}
                    isInvalid={!!error?.message}
                    error={[error?.message]}
                  >
                    <EuiFieldText
                      onChange={onChange}
                      value={value as string}
                      onBlur={onBlur}
                      isInvalid={!!error?.message}
                      placeholder={translate("host")}
                      aria-label={translate("host")}
                    />
                  </EuiFormRow>
                )}
              />
              <Controller
                control={control}
                name={`data.port`}
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <EuiFormRow
                    label={translate("port")}
                    isInvalid={!!error?.message}
                    error={[error?.message]}
                  >
                    <EuiFieldNumber
                      onChange={onChange}
                      value={value}
                      onBlur={onBlur}
                      isInvalid={!!error?.message}
                      placeholder={translate("port")}
                      aria-label={translate("port")}
                    />
                  </EuiFormRow>
                )}
              />
              <Controller
                control={control}
                name={`data.from_email`}
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <EuiFormRow
                    label={translate("from_email")}
                    isInvalid={!!error?.message}
                    error={[error?.message]}
                  >
                    <EuiFieldText
                      onChange={onChange}
                      value={value}
                      onBlur={onBlur}
                      isInvalid={!!error?.message}
                      placeholder={translate("from_email")}
                      aria-label={translate("from_email")}
                    />
                  </EuiFormRow>
                )}
              />
              <Controller
                control={control}
                name={`data.host_user`}
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <EuiFormRow
                    label={translate("host_user")}
                    isInvalid={!!error?.message}
                    error={[error?.message]}
                  >
                    <EuiFieldText
                      onChange={onChange}
                      value={value}
                      onBlur={onBlur}
                      isInvalid={!!error?.message}
                      placeholder={translate("host_user")}
                      aria-label={translate("host_user")}
                    />
                  </EuiFormRow>
                )}
              />
              <Controller
                control={control}
                name={`data.host_password`}
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <EuiFormRow
                    label={translate("host_password")}
                    isInvalid={!!error?.message}
                    error={[error?.message]}
                  >
                    <EuiFieldText
                      onChange={onChange}
                      value={value}
                      onBlur={onBlur}
                      isInvalid={!!error?.message}
                      placeholder={translate("host_password")}
                      aria-label={translate("host_password")}
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
                  <EuiFormRow
                    label={translate("url")}
                    isInvalid={!!error?.message}
                    error={[error?.message]}
                  >
                    <EuiFieldText
                      onChange={onChange}
                      value={value as string}
                      onBlur={onBlur}
                      isInvalid={!!error?.message}
                      placeholder={translate("url")}
                      aria-label={translate("url")}
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
                              label={translate("key")}
                              isInvalid={!!error?.message}
                              error={[error?.message]}
                            >
                              <EuiFieldText
                                onChange={onChange}
                                value={value as string}
                                onBlur={onBlur}
                                isInvalid={!!error?.message}
                                placeholder={translate("key")}
                                aria-label={translate("key")}
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
                              label={translate("value")}
                              isInvalid={!!error?.message}
                              error={[error?.message]}
                            >
                              <EuiFieldText
                                onChange={onChange}
                                value={value as string}
                                onBlur={onBlur}
                                isInvalid={!!error?.message}
                                placeholder={translate("value")}
                                aria-label={translate("value")}
                              />
                            </EuiFormRow>
                          )}
                        />
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <Controller
                          key={field.id}
                          control={control}
                          name={`data.headers.${index}.secure`}
                          render={({
                            field: { onChange, onBlur, value },
                            fieldState: { error },
                          }) => (
                            <EuiFormRow
                              label="Is secure"
                              isInvalid={!!error?.message}
                              error={[error?.message]}
                            >
                              <EuiSwitch
                                id={field.id}
                                label=""
                                checked={value}
                                onBlur={onBlur}
                                onChange={() => {
                                  onChange(!value);
                                }}
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
                    label={translate("rate_limit")}
                    isInvalid={!!error?.message}
                    error={[error?.message]}
                  >
                    <EuiFieldNumber
                      onChange={onChange}
                      value={value as number}
                      onBlur={onBlur}
                      isInvalid={!!error?.message}
                      placeholder={translate("rate_limit")}
                      aria-label={translate("rate_limit")}
                    />
                  </EuiFormRow>
                )}
              />
            </>
          )}
          <EuiFormRow>
            <EuiFlexGroup gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiButton isLoading={isMutating} disabled={isMutating} type="submit">
                  {translate("update_channel")}
                </EuiButton>
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
                    {translate("add_header")}
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
