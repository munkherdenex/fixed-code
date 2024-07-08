import { useContext, useEffect } from "react";
import Head from "next/head";
import Wrapper from "../../components/starter/wrapper";
import { EuiSpacer, EuiTitle, useEuiTheme } from "@elastic/eui";
import { signinStyles } from "../../styles/signin.styles";
import SigninForm from "../../components/signin_form";
import { authContext } from "../../store/auth_store";
import { useRouter } from "next/router";

const Index = () => {
  const router = useRouter();
  const { user } = useContext(authContext);
  const { euiTheme } = useEuiTheme();
  const styles = signinStyles(euiTheme);

  useEffect(() => {
    if (user) {
      router.replace("/dashboards");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Sign in</title>
      </Head>
      <Wrapper>
        <div css={styles.container}>
          <EuiSpacer size="xl" />
          <EuiTitle>
            <h1>Sign in</h1>
          </EuiTitle>
          <EuiSpacer size="m" />
          <SigninForm />
        </div>
      </Wrapper>
    </>
  );
};

export default Index;
