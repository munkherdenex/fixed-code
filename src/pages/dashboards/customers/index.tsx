import { EuiButton } from "@elastic/eui";
import Head from "next/head";
import DashboardLayout from "../../../layouts/dashboard";

const pathPrefix = process.env.PATH_PREFIX;

const CustomersDashboard = () => {
  return (
    <>
      <Head>
        <title>Customers</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Customers",
          iconType: "dashboardApp",
          description: "Create and manage customers.",
          rightSideItems: [
            <EuiButton color="primary" href={`${pathPrefix}/dashboards/customer/create`} fill key="create-customer">
              Create customer
            </EuiButton>,
          ],
        }}
      >
        <div>content</div>
      </DashboardLayout>
    </>
  );
};

export default CustomersDashboard;
