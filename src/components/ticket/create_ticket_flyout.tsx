import {
  EuiButton,
  EuiCallOut,
  EuiFieldText,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiSelect,
  EuiSpacer,
  EuiTextArea,
  EuiTitle,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

const statusOptions = [{ value: "template 1", text: "template 1" }];

const schema = yup
  .object({
    status: yup.string().required(),
    title: yup.string().required(),
    description: yup.string(),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const CreateTicketFlyout = () => {
  const router = useRouter();
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  function onSubmit(data: FormData) {
    console.log(data);
  }

  return (
    <div>
      <EuiButton onClick={() => setIsFlyoutVisible(true)}>Add ticket</EuiButton>
      {isFlyoutVisible && (
        <EuiFlyout ownFocus onClose={() => setIsFlyoutVisible(false)}>
          <EuiFlyoutHeader hasBorder>
            <EuiTitle size="m">
              <h2>Add ticket</h2>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
              {/* TODO: fix this condition */}
              {true && (
                <EuiFormRow>
                  <EuiCallOut title="Proceed with caution!" color="warning" iconType="warning">
                    <p>You need to create a template before you can create a ticket.</p>
                    <EuiButton
                      onClick={() =>
                        router.push("/dashboards/cdp/channels", {
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
                label="Template"
                isInvalid={!!errors.status?.message}
                error={[errors.status?.message]}
              >
                <Controller
                  control={control}
                  name="status"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <EuiSelect
                      hasNoInitialSelection
                      options={statusOptions}
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                    />
                  )}
                />
              </EuiFormRow>
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
                      aria-label="email"
                    />
                  )}
                />
              </EuiFormRow>
              <EuiFormRow
                label="Description"
                isInvalid={!!errors.description?.message}
                error={[errors.description?.message]}
              >
                <Controller
                  control={control}
                  name="description"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <EuiTextArea
                      onChange={onChange}
                      value={value}
                      onBlur={onBlur}
                      isInvalid={!!errors.description?.message}
                      placeholder="description"
                      aria-label="description"
                    />
                  )}
                />
              </EuiFormRow>
              <EuiSpacer size="m" />
              <EuiButton type="submit" fill>
                Create
              </EuiButton>
            </EuiForm>
          </EuiFlyoutBody>
        </EuiFlyout>
      )}
    </div>
  );
};

export default CreateTicketFlyout;
