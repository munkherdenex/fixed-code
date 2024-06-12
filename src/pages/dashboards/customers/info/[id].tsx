import { EuiBreadcrumbs, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import Head from "next/head";
import GeneralDetails from "../../../../components/customers/general_details";
import Overview from "../../../../components/customers/overview";
import DashboardLayout from "../../../../layouts/dashboard";

const Info = () => {
  return (
    <>
      <Head>
        <title>Info</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Info",
          iconType: "usersRolesApp",
        }}
        breadCrumb={
          <EuiBreadcrumbs
            breadcrumbs={[
              {
                text: "Dashboards",
                href: "/dashboards",
              },
              {
                text: "Customers",
                href: "/dashboards/customers",
              },
              {
                text: "Info",
              },
            ]}
            truncate={false}
            aria-label="Customer info breadCrumb"
          />
        }
      >
        <>
          <EuiFlexGroup>
            <EuiFlexItem>
              <GeneralDetails />
            </EuiFlexItem>
            <EuiFlexItem>
              <Overview />
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
      </DashboardLayout>
    </>
  );
};

export default Info;
