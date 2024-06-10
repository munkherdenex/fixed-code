import { FunctionComponent, useState } from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiButton,
  EuiPanel,
  EuiFieldPassword,
} from "@elastic/eui";
import { useEuiTheme } from "@elastic/eui";
import { resetFormStyles } from "./resetpass_form.styles";

const ResetPasswordForm: FunctionComponent = () => {
  const { euiTheme } = useEuiTheme();
  const styles = resetFormStyles(euiTheme);
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
            <EuiFormRow label="New password">
              <EuiFieldPassword name="password" type={dual ? 'dual' : undefined} placeholder="New password" aria-label="password" />
            </EuiFormRow>
            <EuiFormRow label="Repeat password">
              <EuiFieldPassword name="password" type={dual2 ? 'dual' : undefined} placeholder="Repeat password" aria-label="password" />
            </EuiFormRow>
            <EuiButton type="submit" fill>
              Sent
            </EuiButton>
          </EuiForm>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default ResetPasswordForm;
