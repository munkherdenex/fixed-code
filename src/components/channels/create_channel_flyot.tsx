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
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { mutate } from "swr";
import * as yup from "yup";
import useCreateChannel from "../../hooks/useCreateChannel";

const schema = yup
  .object({
    channel_type: yup.string().required(),
    name: yup.string().required(),
    data: yup
      .object({
        url: yup.string().notRequired().default(undefined),
        headers: yup
          .array()
          .of(
            yup
              .object()
              .shape({
                key: yup.string().notRequired().default(undefined),
                value: yup.string().notRequired().default(undefined),
              })
              .notRequired()
              .default(undefined),
          )
          .notRequired()
          .default(undefined),
        rate_limit: yup.number().notRequired().default(undefined),
      })
      .when("channel_type", (channel_type, schema) => {
        if (channel_type[0] === "api") {
          return schema.shape({
            url: yup.string().url().required(),
            headers: yup.array().of(
              yup.object().shape({
                key: yup.string().required("Key is required"),
                value: yup.string().required("Value is required"),
              }),
            ),
            rate_limit: yup.number().positive().integer(),
          });
        }
        if (channel_type[0] === "email") {
          return schema.shape({
            email: yup.string().email().required(),
          });
        }
        return schema.shape({
          url: yup.string().notRequired().default(undefined),
        });
      }),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const dataTypeOptions = [
  { value: "email", text: "Email" },
  { value: "sms", text: "Sms" },
  { value: "push", text: "Push" },
  { value: "inapp", text: "Inapp" },
  { value: "api", text: "Api" },
];

const CreateChannelFlyout = ({ closeFlyout }: { closeFlyout: () => void }) => {
  const flyoutHeadingId = useGeneratedHtmlId({
    prefix: "flyoutTitle",
  });
  const { trigger } = useCreateChannel();

  const {
    handleSubmit,
    control,
    watch,
    resetField,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      channel_type: dataTypeOptions[4].value,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "data.headers",
  });

  const onSubmit = async (data: FormData) => {
    try {
      const prepared_headers = data?.data?.headers
        ? data.data.headers.reduce((a, v) => ({ ...a, [v.key]: v.value }), {})
        : [];

      const response = await trigger({
        ...data,
        data: {
          ...data.data,
          headers: prepared_headers,
        },
      });
      if (response) {
        mutate(`/api/v1/dj/channels/`);
        closeFlyout();
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
    <EuiFlyout onClose={closeFlyout}>
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
                  options={dataTypeOptions}
                  onBlur={onBlur}
                  isInvalid={!!errors.channel_type?.message}
                  aria-label="channel type"
                  hasNoInitialSelection
                />
              )}
            />
          </EuiFormRow>
          {watch("channel_type") === "api" && (
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
          )}
          {watch("channel_type") === "api" &&
            fields.map((field, index) => (
              <>
                <EuiFormRow>
                  <EuiFlexGroup alignItems="center">
                    <EuiFlexItem>
                      <Controller
                        key={field.id}
                        control={control}
                        name={`data.headers.${index}.key`}
                        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
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
                        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
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
          {watch("channel_type") === "api" && (
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
          )}
          <EuiFormRow>
            <EuiFlexGroup gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiButton type="submit">Create custom fields</EuiButton>
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

export default CreateChannelFlyout;
