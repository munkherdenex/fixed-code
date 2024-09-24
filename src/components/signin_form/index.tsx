import {
  EuiButton,
  EuiFieldPassword,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiLink,
  EuiPanel,
  EuiSpacer,
  EuiText,
  useEuiTheme,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { jsonrepair } from "jsonrepair";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import useLogin from "../../hooks/useLogin";
import useSendEmailVerification from "../../hooks/useSendEmailVerification";
import { globalMutate } from "../../utils/globalMutate";
import { addToast } from "../toast";
import { signinFormStyles } from "./signin_form.styles";

const schema = yup
  .object({
    email: yup.string().email().required("please enter your email address"),
    password: yup.string().min(6).required("please enter your password"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const SigninForm: FunctionComponent = () => {
  const router = useRouter();
  const { euiTheme } = useEuiTheme();
  const styles = signinFormStyles(euiTheme);

  const { trigger, isMutating, error } = useLogin<FormData>();
  const { trigger: sendVerificationTrigger } = useSendEmailVerification();

  const {
    handleSubmit,
    control,
    getValues,

    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
  });

  const needsVerify = JSON.parse(jsonrepair(error?.message || "{}"))?.needs_verify || false;

  const onSubmit = async (data: FormData) => {
    try {
      const response = await trigger(data);
      if (response) {
        globalMutate("/api/v1/profile");
        router.push("/dashboards");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendVerification = async () => {
    try {
      const response = await sendVerificationTrigger({
        email: getValues("email"),
      });
      if (response) {
        addToast({
          id: "verification-email",
          title: "Verification email sent",
          color: "success",
          text: "Please check your email for the verification link",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (needsVerify) {
    return (
      <>
        <EuiPanel>
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <EuiButton
                iconSide="left"
                iconType="email"
                isLoading={isMutating}
                type="button"
                onClick={sendVerification}
              >
                Sends verification to email
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText>
                <p>
                  Your email address has not been verified. Please check your email for the
                  verification link.
                </p>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
        <EuiSpacer />
      </>
    );
  }

  return (
    <EuiFlexGroup gutterSize="xl" css={styles.container} direction="column">
      <EuiFlexItem>
        <EuiPanel>
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
            <EuiFormRow
              label="Password"
              isInvalid={!!errors.password?.message}
              error={[errors.password?.message]}
            >
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <EuiFieldPassword
                    onChange={onChange}
                    value={value}
                    onBlur={onBlur}
                    isInvalid={!!errors.password?.message}
                    type={"dual"}
                    placeholder="Password"
                    aria-label="password"
                  />
                )}
              />
            </EuiFormRow>
            <EuiSpacer size="m" />
            <EuiFlexGroup direction="column" justifyContent="spaceBetween" gutterSize="s">
              <EuiFlexItem>
                <EuiButton isLoading={isMutating} type="submit" fill>
                  Sign in
                </EuiButton>
              </EuiFlexItem>
              {needsVerify && (
                <EuiFlexItem>
                  <EuiButton
                    iconSide="left"
                    iconType="email"
                    isLoading={isMutating}
                    type="button"
                    onClick={sendVerification}
                  >
                    Sends verification to email
                  </EuiButton>
                </EuiFlexItem>
              )}
              <EuiFlexItem>
                <EuiText size="relative" grow={false}>
                  <EuiLink onClick={() => router.push("/forgot_password")}>
                    Forgot password?
                  </EuiLink>
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiForm>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default SigninForm;
