import { EuiBreadcrumbs, useGeneratedHtmlId } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import CustomersTable from "../../../../components/customers/table";
import DashboardLayout from "../../../../layouts/dashboard";
import CreateCustomerFlyoutContainer from "../../../../components/customers/create_customer_flyout_container";
import ImportAudienceFlyoutContainer from "../../../../components/customers/import_audience_flyout_container";
import { useTranslations } from "next-intl";

const pathPrefix = process.env.PATH_PREFIX;

const CustomersDashboard = () => {
  const router = useRouter();
  const translate = useTranslations();
  const createCustomerFlyoutContainerId = useGeneratedHtmlId();
  const importAudienceFlyoutContainerId = useGeneratedHtmlId();

  return (
    <>
      <Head>
        <title>{translate("title")}</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: translate("title"),
          iconType: "usersRolesApp",
          rightSideItems: [
            <CreateCustomerFlyoutContainer key={createCustomerFlyoutContainerId} />,
            <ImportAudienceFlyoutContainer key={importAudienceFlyoutContainerId} />,
          ],
        }}
        breadCrumb={
          <EuiBreadcrumbs
            breadcrumbs={[
              {
                text: "Dashboards",
                onClick: () => router.push(`${pathPrefix}/dashboards`),
              },
              {
                text: "Audience",
              },
            ]}
            truncate={false}
            aria-label="Customer info breadCrumb"
          />
        }
      >
        <div>
          <CustomersTable />
        </div>
      </DashboardLayout>
    </>
  );
};

export async function getStaticProps(context) {
  const common = (await import(`../../../../messages/${context.locale}/common.json`)).default;
  const audience = (await import(`../../../../messages/${context.locale}/audience.json`)).default;

  return {
    props: {
      messages: {
        ...common,
        ...audience,
      },
    },
  };
}

export default CustomersDashboard;
