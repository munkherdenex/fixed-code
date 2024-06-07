import { FunctionComponent } from "react";
import Head from "next/head";
import Wrapper from "../../components/starter/wrapper";
import SignupForm from "../../components/signup_form";
import { EuiSpacer, EuiTitle, useEuiTheme } from "@elastic/eui";
import { signupStyles } from "../../styles/signup.styles";

const Index: FunctionComponent = () => {
  const { euiTheme } = useEuiTheme();
  const styles = signupStyles(euiTheme);

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <Wrapper>
        <div css={styles.container}>
          <EuiSpacer size="xl" />
          <EuiTitle>
            <h1>Signup</h1>
          </EuiTitle>
          <EuiSpacer size="m" />
          <SignupForm />
        </div>
      </Wrapper>
    </>
  );
};

export default Index;
