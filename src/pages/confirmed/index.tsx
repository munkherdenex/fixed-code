import Head from "next/head";
import Wrapper from "../../components/starter/wrapper";
import { EuiSpacer, useEuiTheme } from "@elastic/eui";
import { resetStyles } from "../../styles/reset.styles";
import ConfirmForm from "../../components/confirm_form";

const Confirmation = () => {
  const { euiTheme } = useEuiTheme();
  const styles = resetStyles(euiTheme);

  return (
    <>
      <Head>
        <title>Confirm</title>
      </Head>
      <Wrapper>
        <div css={styles.container}>
          <EuiSpacer size="xl" />
          <ConfirmForm />
        </div>
      </Wrapper>
    </>
  );
};

export default Confirmation;