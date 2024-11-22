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
  const audienceT = useTranslations("dashboards.cdp.audience");
  const createCustomerFlyoutContainerId = useGeneratedHtmlId();
  const importAudienceFlyoutContainerId = useGeneratedHtmlId();

  return (
    <>
      <Head>
        <title>Audience</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: audienceT("title"),
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
  return {
    props: {
      messages: (await import(`../../../../messages/${context.locale}.json`)).default,
    },
  };
}

export default CustomersDashboard;
