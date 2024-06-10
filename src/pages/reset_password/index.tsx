import { FunctionComponent, useEffect, useState } from "react";
import Head from "next/head";
import Wrapper from "../../components/starter/wrapper";
import { EuiSpacer, EuiTitle, useEuiTheme } from "@elastic/eui";
import { resetStyles } from "../../styles/reset.styles";
import ResetPasswordForm from "../../components/resetpass_form";
import ForgotPasswordForm from "../../components/forgotpass_form";

const Index: FunctionComponent = () => {
  const { euiTheme } = useEuiTheme();
  const styles = resetStyles(euiTheme);
  const [step, setStep] = useState<Number>(1);

  const changeStep = (value: Number) => {
    setStep(value);
  }

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
          {
            (step === 1) ? <ForgotPasswordForm changeStep={changeStep} /> : (step === 2 ? <ResetPasswordForm /> : alert('Step error'))
          }
        </div>
      </Wrapper>
    </>
  );
};

export default Index;
