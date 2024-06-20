import { EuiBreadcrumbs, EuiButton } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import CreateFieldFlyout from "../../../components/custom_fields/create_field_flyout";
import FieldsTable from "../../../components/custom_fields/table";
import DashboardLayout from "../../../layouts/dashboard";

const CustomFields = () => {
  const router = useRouter();
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  const closeFlyout = () => {
    setIsFlyoutVisible(false);
  };

  return (
    <>
      <Head>
        <title>Custom fields</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Custom fields",
          iconType: "usersRolesApp",
          rightSideItems: [
            <EuiButton
              color="primary"
              onClick={() => setIsFlyoutVisible(true)}
              fill
              key="create-customer"
            >
              Create custom field
            </EuiButton>,
          ],
        }}
        breadCrumb={
          <EuiBreadcrumbs
            breadcrumbs={[
              {
                text: "Dashboards",
                onClick: () => router.push("/dashboards"),
              },
              {
                text: "Custom fields",
              },
            ]}
            truncate={false}
            aria-label="Customer info breadCrumb"
          />
        }
      >
        <div>
          <FieldsTable />
          {isFlyoutVisible && <CreateFieldFlyout closeFlyout={closeFlyout} />}
        </div>
      </DashboardLayout>
    </>
  );
};

export default CustomFields;
