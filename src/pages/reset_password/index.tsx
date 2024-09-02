import Head from "next/head";
import Wrapper from "../../components/starter/wrapper";
import { EuiSpacer, EuiTitle, useEuiTheme } from "@elastic/eui";
import { resetStyles } from "../../styles/reset.styles";
import ResetPasswordForm from "../../components/resetpass_form";

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
          <ResetPasswordForm />
        </div>
      </Wrapper>
    </>
  );
};

export default ResetPassword;

export async function getServerSideProps(context) {
  const query = context.query;
  if (query?.token) {
    return {
      props: {},
    };
  }
  return {
    redirect: {
      permanent: false,
      destination: "/signin",
    },
    props: {},
  };
}
