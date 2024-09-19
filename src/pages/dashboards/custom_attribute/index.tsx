import { EuiBreadcrumbs, useGeneratedHtmlId } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import CreateFieldFlyoutContainer from "../../../components/custom_attribute/create_field_flyout_container";
import FieldsTable from "../../../components/custom_attribute/table";
import DashboardLayout from "../../../layouts/dashboard";

const CustomFields = () => {
  const router = useRouter();
  const createFieldFlyoutContainerId = useGeneratedHtmlId();

  return (
    <>
      <Head>
        <title>Custom attribute</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Custom attribute",
          iconType: "usersRolesApp",
          rightSideItems: [<CreateFieldFlyoutContainer key={createFieldFlyoutContainerId} />],
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
          <FieldsTable />
        </div>
      </DashboardLayout>
    </>
  );
};

export default CustomFields;
