import { FunctionComponent } from "react";
import Head from "next/head";
import Wrapper from "../../components/starter/wrapper";
import { EuiSpacer, EuiTitle, useEuiTheme } from "@elastic/eui";
import { signinStyles } from "../../styles/signin.styles";
import SigninForm from "../../components/signin_form";

const Index: FunctionComponent = () => {
  const { euiTheme } = useEuiTheme();
  const styles = signinStyles(euiTheme);

  return (
    <>
      <Head>
        <title>Home</title>
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
