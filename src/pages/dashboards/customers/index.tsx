import { EuiBreadcrumbs, EuiButton } from "@elastic/eui";
import Head from "next/head";
import { useState } from "react";
import CreateCustomerComponent from "../../../components/customers/create_customer";
import CustomersTable from "../../../components/customers/table";
import DashboardLayout from "../../../layouts/dashboard";

const pathPrefix = process.env.PATH_PREFIX;

const CustomersDashboard = () => {
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  return (
    <>
      <Head>
        <title>Customers</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Customers",
          iconType: "usersRolesApp",
          rightSideItems: [
            <EuiButton
              color="primary"
              onClick={() => setIsFlyoutVisible(true)}
              fill
              key="create-customer"
            >
              Create customer
            </EuiButton>,
          ],
        }}
        breadCrumb={
          <EuiBreadcrumbs
            breadcrumbs={[
              {
                text: "Dashboards",
                href: `${pathPrefix}/dashboards`,
              },
              {
                text: "Customers",
              },
            ]}
            truncate={false}
            aria-label="Customer info breadCrumb"
          />
        }
      >
        <div>
          <CustomersTable />
          {isFlyoutVisible && <CreateCustomerComponent setIsFlyoutVisible={setIsFlyoutVisible} />}
        </div>
      </DashboardLayout>
    </>
  );
};

export default CustomersDashboard;
