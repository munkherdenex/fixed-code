import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiButton,
  EuiPanel,
  EuiEmptyPrompt,
  EuiSpacer,
} from "@elastic/eui";
import { useEuiTheme } from "@elastic/eui";
import { forgotFormStyles } from "./forgotpass_form.styles";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useForgotPassword from "../../hooks/useForgotPassword";
import { useState } from "react";
import { addToast } from "../toast";

const schema = yup
  .object({
    email: yup.string().email().required("please enter your email address"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

function ForgotPasswordForm() {
  const { euiTheme } = useEuiTheme();
  const styles = forgotFormStyles(euiTheme);
  const { trigger, isMutating } = useForgotPassword<FormData>();
  const [showMessage, setShowMessage] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await trigger(data);
      if (response) {
        addToast({
          id: "forgot-password-res",
          color: "success",
          title: "Success",
          text: "Email sent successful",
        });
        setShowMessage(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <EuiFlexGroup gutterSize="xl" css={styles.container}>
      <EuiFlexItem>
        <EuiPanel>
          {showMessage ? (
            <EuiEmptyPrompt
              title={<h2>Success</h2>}
              body={<p>Please check your email address</p>}
            />
          ) : (
            <EuiForm component="form" css={styles.form.container} onSubmit={handleSubmit(onSubmit)}>
              <EuiFormRow
                label="Email"
                isInvalid={!!errors.email?.message}
                error={[errors.email?.message]}
              >
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <EuiFieldText
                      onChange={onChange}
                      value={value}
                      onBlur={onBlur}
                      isInvalid={!!errors.email?.message}
                      placeholder="Email"
                      aria-label="email"
                    />
                  )}
                />
              </EuiFormRow>
              <EuiSpacer size="m" />
              <EuiFlexGroup direction="column" justifyContent="spaceBetween" gutterSize="s">
                <EuiFlexItem>
                  <EuiButton isLoading={isMutating} disabled={isMutating} type="submit" fill>
                    Get reset info
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiForm>
          )}
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}

export default ForgotPasswordForm;
