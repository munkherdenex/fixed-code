import { EuiBreadcrumbs, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import GeneralDetails from "../../../../../components/customers/general_details";
import Overview from "../../../../../components/customers/overview";
import DashboardLayout from "../../../../../layouts/dashboard";
import { useTranslations } from "next-intl";

const Info = () => {
  const router = useRouter();
  const audienceT = useTranslations();

  return (
    <>
      <Head>
        <title>{audienceT("audience-info")}</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: audienceT("audience-info"),
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
              <Overview />
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
      </DashboardLayout>
    </>
  );
};

export async function getStaticPaths() {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
}

export async function getStaticProps(context) {
  return {
    props: {
      messages: (await import(`../../../../../messages/${context.locale}/audience.json`)).default,
    },
  };
}

export default Info;
