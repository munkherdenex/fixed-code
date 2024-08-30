import { EuiBreadcrumbs, EuiButton } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import CreateCustomerComponent from "../../../components/customers/create_customer";
import CustomersTable from "../../../components/customers/table";
import DashboardLayout from "../../../layouts/dashboard";
import ImportAudienceComponent from "../../../components/customers/import_audience";

const pathPrefix = process.env.PATH_PREFIX;

const CustomersDashboard = () => {
  const router = useRouter();
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const [isImportFlyoutVisible, setIsImportFlyoutVisible] = useState(false);

  return (
    <>
      <Head>
        <title>Audience</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Audience",
          iconType: "usersRolesApp",
          rightSideItems: [
            <EuiButton
              color="primary"
              onClick={() => setIsFlyoutVisible(true)}
              fill
              key="audience-customer"
            >
              Create audience
            </EuiButton>,
            <EuiButton
              onClick={() => setIsImportFlyoutVisible(true)}
              fill
              color={"success"}
              iconType={"importAction"}
              key="audience-customer"
            >
              Import
            </EuiButton>,
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
          <CustomersTable openCreateChannelFlyout={() => setIsFlyoutVisible(true)} />
          {isFlyoutVisible && <CreateCustomerComponent setIsFlyoutVisible={setIsFlyoutVisible} />}
          {isImportFlyoutVisible && (
            <ImportAudienceComponent setIsImportFlyoutVisible={setIsImportFlyoutVisible} />
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default CustomersDashboard;
