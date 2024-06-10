import { Dispatch, SetStateAction } from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiButton,
  EuiPanel,
} from "@elastic/eui";
import { useEuiTheme } from "@elastic/eui";
import { forgotFormStyles } from "./forgotpass_form.styles";

interface forgotPropsType {
  changeStep: (value: Number) => void;
}

function ForgotPasswordForm({ changeStep }: forgotPropsType) {
  const { euiTheme } = useEuiTheme();
  const styles = forgotFormStyles(euiTheme);


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Form submitted!");
    changeStep(2);
  };

  return (
    <EuiFlexGroup gutterSize="xl" css={styles.container}>
      <EuiFlexItem>
        <EuiPanel>
          <EuiForm component="form" css={styles.form.container} onSubmit={handleSubmit}>
            <EuiFormRow label="Email">
              <EuiFieldText name="email" placeholder="Email" aria-label="email" />
            </EuiFormRow>

            <EuiButton type="submit" fill>
              Get reset info
            </EuiButton>
          </EuiForm>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}

export default ForgotPasswordForm;
