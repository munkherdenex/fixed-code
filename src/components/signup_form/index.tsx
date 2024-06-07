import { FunctionComponent } from "react";
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Form submitted!");
  };

  return (
    <EuiFlexGroup gutterSize="xl" css={styles.container}>
      <EuiFlexItem>
        <EuiPanel>
          <EuiForm component="form" css={styles.form.container} onSubmit={handleSubmit}>
            <EuiFormRow label="First name">
              <EuiFieldText name="first_name" placeholder="First name" aria-label="first name" />
            </EuiFormRow>
            <EuiFormRow label="Password">
              <EuiFieldPassword name="password" type="password" placeholder="Password" aria-label="password" />
            </EuiFormRow>
            <EuiButton type="submit" fill>
              Save form
            </EuiButton>
          </EuiForm>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default SignupForm;
