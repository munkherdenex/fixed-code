import { useContext, useEffect } from "react";
import Head from "next/head";
import Wrapper from "../../components/starter/wrapper";
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle } from "@elastic/eui";
import SigninForm from "../../components/signin_form";
import { authContext } from "../../store/auth_store";
import { useRouter } from "next/router";
import { IS_POCKET } from "../../constants";
import { useTranslations } from "next-intl";
import { GetStaticProps } from "next/types";

const Index = () => {
  const router = useRouter();
  const { user, isLoading } = useContext(authContext);
  const t = useTranslations("sign-in");

  useEffect(() => {
    if (user) {
      router.replace("/dashboards");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <Wrapper>
        <div>
          <EuiFlexGroup direction="column" alignItems="center" gutterSize="xs">
            <EuiSpacer size="xl" />
            <EuiFlexItem grow={false}>
              <EuiTitle>
                <h1>{t("title")}</h1>
              </EuiTitle>
            </EuiFlexItem>
            <EuiSpacer size="xl" />
            <EuiFlexItem grow={false}>
              <SigninForm />
            </EuiFlexItem>
            {IS_POCKET && (
              <EuiFlexItem grow={false}>
                <EuiButton size="s" href="/api/v1/login">
                  {t("login-with-pocket")}
                </EuiButton>
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </div>
      </Wrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      messages: (await import(`../../messages/${context.locale}.json`)).default,
    },
  };
};

export default Index;
