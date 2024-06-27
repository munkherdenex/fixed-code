import Head from "next/head";
import Wrapper from "../../components/starter/wrapper";
import { EuiSpacer, EuiTitle, useEuiTheme } from "@elastic/eui";
import { resetStyles } from "../../styles/reset.styles";
import ForgotPasswordForm from "../../components/forgotpass_form";

const ResetPassword = () => {
  const { euiTheme } = useEuiTheme();
  const styles = resetStyles(euiTheme);

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <Wrapper>
        <div css={styles.container}>
          <EuiSpacer size="xl" />
          <EuiTitle>
            <h1>Reset password</h1>
          </EuiTitle>
          <EuiSpacer size="m" />
          <ForgotPasswordForm />
        </div>
      </Wrapper>
    </>
  );
};

export default ResetPassword;
