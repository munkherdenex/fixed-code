import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiPanel,
  EuiEmptyPrompt,
  EuiAvatar,
  EuiSpacer,
  EuiTitle,
} from "@elastic/eui";
import { useEuiTheme } from "@elastic/eui";
import { confirmFormStyles } from "./confirm_form.styles";
import { useRouter } from "next/router";

function ConfirmForm() {
  const { euiTheme } = useEuiTheme();
  const styles = confirmFormStyles(euiTheme);
  const route = useRouter();

  return (
    <EuiFlexGroup gutterSize="xl" css={styles.container}>
      <EuiFlexItem>
        <EuiPanel>
          <EuiEmptyPrompt
            title={
              <>
                <EuiAvatar size="xl" name="check" iconType="check" />
                <EuiSpacer size="m" />
                <EuiTitle size="l">
                  <h1>Thanks for signing up</h1>
                </EuiTitle>
              </>
            }
            body={
              <p>
                You subscription has been confirmed.You&apos;ve been added to our list and will hear
                from us soon.
              </p>
            }
            actions={
              <EuiButton
                onClick={() => {
                  route.push("/signin");
                }}
              >
                Sign In
              </EuiButton>
            }
          />
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}

export default ConfirmForm;
