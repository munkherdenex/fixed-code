import { useContext, useEffect } from "react";
import Head from "next/head";
import Wrapper from "../../components/starter/wrapper";
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle } from "@elastic/eui";
import SigninForm from "../../components/signin_form";
import { authContext } from "../../store/auth_store";
import { useRouter } from "next/router";

const Index = () => {
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
        <title>Sign in</title>
      </Head>
      <Wrapper>
        <div>
          <EuiFlexGroup direction="column" alignItems="center" gutterSize="xs">
            <EuiFlexItem grow={false}>
              <EuiSpacer size="xl" />
              <EuiTitle>
                <h1>Sign in</h1>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSpacer size="xl" />
              <SigninForm />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton size="s" href="/api/v1/login">
                Login with keycloak
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
      </Wrapper>
    </>
  );
};

export default Index;
