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

const SignupForm: FunctionComponent = () => {
  const { euiTheme } = useEuiTheme();
  const styles = signupFormStyles(euiTheme);
  const [dual] = useState(true);
  const [dual2] = useState(true);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Form submitted!");
  };

  return (
    <EuiFlexGroup gutterSize="xl" css={styles.container}>
      <EuiFlexItem>
        <EuiPanel>
          <EuiForm component="form" css={styles.form.container} onSubmit={handleSubmit}>
            <EuiFormRow label="Username">
              <EuiFieldText name="user_name" placeholder="User name" aria-label="user name" />
            </EuiFormRow>
            <EuiFormRow label="Password">
              <EuiFieldPassword
                name="password"
                type={dual ? "dual" : undefined}
                placeholder="Password"
                aria-label="password"
              />
            </EuiFormRow>
            <EuiFormRow label="Repeat password">
              <EuiFieldPassword
                name="password2"
                type={dual2 ? "dual" : undefined}
                placeholder="Repeat password"
                aria-label="repeat password"
              />
            </EuiFormRow>
            <EuiButton type="submit" fill>
              Register
            </EuiButton>
          </EuiForm>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default SignupForm;
