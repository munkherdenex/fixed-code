import {
  EuiButton,
  EuiFieldPassword,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiPanel,
  EuiSpacer,
  useEuiTheme,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { signinFormStyles } from "../signin_form/signin_form.styles";
import { addToast } from "../toast";
import useResetPassword from "../../hooks/useResetPassword";
import { useRouter } from "next/router";

const schema = yup
  .object({
    password: yup
      .string()
      .min(8)
      .matches(/[0-9]/, "Password requires a number")
      .matches(/[a-z]/, "Password requires a lowercase letter")
      .matches(/[A-Z]/, "Password requires an uppercase letter")
      .matches(/[^\w]/, "Password requires a symbol")
      .required("please enter your password"),
    confirm_password: yup.string().required("please enter old password"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const ResetPassword = () => {
  const { euiTheme } = useEuiTheme();
  const styles = signinFormStyles(euiTheme);
  const { trigger, isMutating } = useResetPassword<FormData>();
  const router = useRouter();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const token = router.query?.p3 || "";
    const email = router.query?.p4 || "";
    if (token && email) {
      try {
        const request_data = {
          ...data,
          token: token,
          email: email,
        };
        const response = await trigger(request_data);
        if (response) {
          addToast({
            id: "reset-password",
            color: "success",
            title: "Success",
            text: "Successfully reset",
          });
          router.push("/signin");
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      alert("ERROR");
    }
  };

  return (
    <EuiFlexGroup css={styles.container} direction="column">
      <EuiFlexItem>
        <EuiPanel>
          <EuiForm component="form" css={styles.form.container} onSubmit={handleSubmit(onSubmit)}>
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
                    placeholder="password"
                    aria-label="password"
                  />
                )}
              />
            </EuiFormRow>
            <EuiFormRow
              label="Confirm password"
              isInvalid={!!errors.confirm_password?.message}
              error={[errors.confirm_password?.message]}
            >
              <Controller
                control={control}
                name="confirm_password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <EuiFieldPassword
                    onChange={onChange}
                    value={value}
                    onBlur={onBlur}
                    isInvalid={!!errors.confirm_password?.message}
                    type={"dual"}
                    placeholder="Confirm password"
                    aria-label="confirm_password"
                  />
                )}
              />
            </EuiFormRow>
            <EuiSpacer size="m" />
            <EuiFlexGroup direction="column" justifyContent="spaceBetween" gutterSize="s">
              <EuiFlexItem>
                <EuiButton isLoading={isMutating} type="submit" fill>
                  Sent
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiForm>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default ResetPassword;
