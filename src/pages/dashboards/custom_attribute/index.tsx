import { EuiBreadcrumbs, EuiButton } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import CreateFieldFlyout from "../../../components/custom_attribute/create_field_flyout";
import FieldsTable from "../../../components/custom_attribute/table";
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
        <title>Custom attribute</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Custom attribute",
          iconType: "usersRolesApp",
          rightSideItems: [
            <EuiButton
              color="primary"
              onClick={() => setIsFlyoutVisible(true)}
              fill
              key="create-customer"
            >
              Create custom attribute
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
                text: "Custom attribute",
              },
            ]}
            truncate={false}
            aria-label="Customer info breadCrumb"
          />
        }
      >
        <div>
          <FieldsTable openCreateChannelFlyout={() => setIsFlyoutVisible(true)} />
          {isFlyoutVisible && <CreateFieldFlyout closeFlyout={closeFlyout} />}
        </div>
      </DashboardLayout>
    </>
  );
};

export default CustomFields;
