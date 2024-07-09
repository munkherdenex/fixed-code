import { FunctionComponent, useContext, useEffect } from "react";
import Head from "next/head";
import Wrapper from "../../components/starter/wrapper";
import SignupForm from "../../components/signup_form";
import { EuiSpacer, EuiTitle, useEuiTheme } from "@elastic/eui";
import { signupStyles } from "../../styles/signup.styles";
import { useRouter } from "next/router";
import { authContext } from "../../store/auth_store";

const Index: FunctionComponent = () => {
  const router = useRouter();
  const { user } = useContext(authContext);
  const { euiTheme } = useEuiTheme();
  const styles = signupStyles(euiTheme);

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
        <title>Sign up</title>
      </Head>
      <Wrapper>
        <div css={styles.container}>
          <EuiSpacer size="xl" />
          <EuiTitle>
            <h1>Sign Up</h1>
          </EuiTitle>
          <EuiSpacer size="m" />
          <SignupForm />
        </div>
      </Wrapper>
    </>
  );
};

export default Index;
