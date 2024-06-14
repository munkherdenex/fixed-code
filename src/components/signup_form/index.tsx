import { FunctionComponent, useState } from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiButton,
  EuiPanel,
  EuiFieldPassword,
} from "@elastic/eui";
import { useEuiTheme } from "@elastic/eui";
import { signupFormStyles } from "./signup_form.styles";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import useSignUp from "../../hooks/useSignUp";
import { Controller, useForm } from "react-hook-form";
import { addToast } from "../toast";

const schema = yup
  .object({
    fname: yup.string().required("please enter your firstname"),
    lname: yup.string().required("please enter your lastname"),
    email: yup.string().email().required("please enter your email address"),
    password: yup.string().min(8)
      .matches(/[0-9]/, 'Password requires a number')
      .matches(/[a-z]/, 'Password requires a lowercase letter')
      .matches(/[A-Z]/, 'Password requires an uppercase letter')
      .matches(/[^\w]/, 'Password requires a symbol').required("please enter your password"),
  })
  .required();
type FormData = yup.InferType<typeof schema>;

const SignupForm: FunctionComponent = () => {
  const { euiTheme } = useEuiTheme();
  const styles = signupFormStyles(euiTheme);
  const { trigger, isMutating } = useSignUp<FormData>();
  const router = useRouter();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await trigger(data);
      if (response.ok) {
        addToast({
          id: "signUp-success",
          color: "success",
          title: "Success",
          text: 'Successfully register',
        });
        router.push("/signin");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <EuiFlexGroup gutterSize="xl" css={styles.container}>
      <EuiFlexItem>
        <EuiPanel>
          <EuiForm component="form" css={styles.form.container} onSubmit={handleSubmit(onSubmit)}>
            <EuiFormRow
              label="First name"
              isInvalid={!!errors.fname?.message}
              error={[errors.fname?.message]}
            >
              <Controller
                control={control}
                name="fname"
                render={({ field: { onChange, onBlur, value } }) => (
                  <EuiFieldText
                    onChange={onChange}
                    value={value}
                    onBlur={onBlur}
                    isInvalid={!!errors.fname?.message}
                    placeholder="First name"
                    aria-label="first name"
                  />
                )}
              />
            </EuiFormRow>
            <EuiFormRow
              label="Last name"
              isInvalid={!!errors.lname?.message}
              error={[errors.lname?.message]}
            >
              <Controller
                control={control}
                name="lname"
                render={({ field: { onChange, onBlur, value } }) => (
                  <EuiFieldText
                    onChange={onChange}
                    value={value}
                    onBlur={onBlur}
                    isInvalid={!!errors.lname?.message}
                    placeholder="Last name"
                    aria-label="last name"
                  />
                )}
              />
            </EuiFormRow>
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
                    type="dual"
                    placeholder="Password"
                    aria-label="password"
                  />
                )}
              />
            </EuiFormRow>
            <EuiButton type="submit" isLoading={isMutating} fill>
              Register
            </EuiButton>
          </EuiForm>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default SignupForm;
