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

const SigninForm: FunctionComponent = () => {
  const { euiTheme } = useEuiTheme();
  const styles = signinFormStyles(euiTheme);
  const [dual] = useState(true);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Form submitted!");
  };

  return (
    <EuiFlexGroup gutterSize="xl" css={styles.container}>
      <EuiFlexItem>
        <EuiPanel>
          <EuiForm component="form" css={styles.form.container} onSubmit={handleSubmit}>
            <EuiFormRow label="User name">
              <EuiFieldText name="user_name" placeholder="User name" aria-label="user name" />
            </EuiFormRow>
            <EuiFormRow label="Password">
              <EuiFieldPassword name="password" type={dual ? 'dual' : undefined} placeholder="Password" aria-label="password" />
            </EuiFormRow>
            <EuiButton type="submit" fill>
              Sign in
            </EuiButton>
          </EuiForm>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default SigninForm;
