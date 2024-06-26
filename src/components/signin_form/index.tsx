import {
  EuiButton,
  EuiFieldPassword,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiPanel,
  useEuiTheme,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import useLogin from "../../hooks/useLogin";
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
  const { trigger, isMutating } = useLogin<FormData>();

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
        router.push("/dashboards");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <EuiFlexGroup gutterSize="xl" css={styles.container}>
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
            <EuiButton isLoading={isMutating} type="submit">
              Sign in
            </EuiButton>
          </EuiForm>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default SigninForm;
