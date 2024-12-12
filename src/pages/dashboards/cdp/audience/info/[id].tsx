import { EuiBreadcrumbs, EuiFlexGroup, EuiFlexItem, EuiPanel, EuiSpacer } from "@elastic/eui";
import { useTranslations } from "next-intl";
import Head from "next/head";
import { useRouter } from "next/router";
import GeneralDetails from "../../../../../components/customers/general_details";
import Graph from "../../../../../components/customers/graph";
import Overview from "../../../../../components/customers/overview";
import Total from "../../../../../components/customers/total";
import DashboardLayout from "../../../../../layouts/dashboard";
import { AudienceProvider } from "../../../../../store/audience_store";
import { GetStaticProps } from "next/types";

const Info = () => {
  const router = useRouter();
  const translate = useTranslations();

  return (
    <>
      <Head>
        <title>{translate("audience-info")}</title>
      </Head>
      <AudienceProvider>
        <DashboardLayout
          pageHeader={{
            pageTitle: translate("audience-info"),
            iconType: "usersRolesApp",
          }}
          breadCrumb={
            <EuiBreadcrumbs
              breadcrumbs={[
                {
                  text: "Dashboards",
                  onClick: () => router.push("/dashboards"),
                },
                {
                  text: "Audience",
                  onClick: () => router.push("/dashboards/cdp/audience"),
                },
                {
                  text: "Info",
                },
              ]}
              truncate={false}
              aria-label="Audience info breadCrumb"
            />
          }
        >
          <>
            <EuiFlexGroup>
              <EuiFlexItem grow={4}>
                <GeneralDetails />
              </EuiFlexItem>
              <EuiFlexItem grow={7}>
                <EuiFlexGroup direction="column">
                  <EuiFlexItem grow={false}>
                    <EuiPanel>
                      <Graph />
                      <EuiSpacer />
                      <Total />
                    </EuiPanel>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <Overview />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </>
        </DashboardLayout>
      </AudienceProvider>
    </>
  );
};

export async function getStaticPaths() {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
}

export const getStaticProps: GetStaticProps = async (context) => {
  const audience = (await import(`../../../../../messages/${context.locale}/audience.json`))
    .default;
  const common = (await import(`../../../../../messages/${context.locale}/common.json`)).default;
  return {
    props: {
      messages: {
        ...audience,
        ...common,
      },
    },
  };
};

export default Info;
