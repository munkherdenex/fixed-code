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
import { signinFormStyles } from "./signin_form.styles";
import useLogin from "../../hooks/useLogin";
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from "next/router";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';


const schema = yup.object({
  email: yup.string().email().required('please enter your email address'),
  password: yup.string().min(8).required('please enter your password'),
}).required();


const SigninForm: FunctionComponent = () => {
  const { euiTheme } = useEuiTheme();
  const styles = signinFormStyles(euiTheme);
  const [dual] = useState(true);
  const { trigger, error } = useLogin<any>();
  const router = useRouter();

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema)
  });


  const onSubmit = async (data) => {
    try {
      const response = await trigger(data);
      if (response.ok) {
        router.push('/reset_password');
      } else {
        alert(response?.status);
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
            <EuiFormRow label="Email" isInvalid={!!errors.email?.message} error={[errors.email?.message]}>
              <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
                <EuiFieldText onChange={onChange} value={value} onBlur={onBlur} isInvalid={!!errors.email?.message} placeholder="Email" aria-label="email" />
              )} />
            </EuiFormRow>
            <EuiFormRow label="Password" isInvalid={!!errors.password?.message} error={[errors.password?.message]}>
              <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
                <EuiFieldPassword onChange={onChange} value={value} onBlur={onBlur} isInvalid={!!errors.password?.message} type={dual ? 'dual' : undefined} placeholder="Password"
                  aria-label="password" />
              )} />
            </EuiFormRow>
            <EuiButton type="submit">
              Sign in
            </EuiButton>
          </EuiForm>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default SigninForm;
