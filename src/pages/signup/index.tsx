import { FunctionComponent, useContext, useEffect } from "react";
import Head from "next/head";
import Wrapper from "../../components/starter/wrapper";
import SignupForm from "../../components/signup_form";
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle } from "@elastic/eui";
import { useRouter } from "next/router";
import { authContext } from "../../store/auth_store";

const Index: FunctionComponent = () => {
  const router = useRouter();
  const { user } = useContext(authContext);

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
        <EuiFlexGroup direction="column" alignItems="center" gutterSize="xs">
          <EuiFlexItem grow={false}>
            <EuiSpacer size="xl" />
            <EuiTitle>
              <h1>Sign up</h1>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSpacer size="xl" />
            <SignupForm />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton size="s" href="/api/v1/login">
              Login with keycloak
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </Wrapper>
    </>
  );
};

export default Index;
