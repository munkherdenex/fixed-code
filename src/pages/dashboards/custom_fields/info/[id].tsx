import { EuiBreadcrumbs } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import GeneralDetails from "../../../../components/custom_fields/general_details";
import DashboardLayout from "../../../../layouts/dashboard";

const CustomFieldsInfo = () => {
  const router = useRouter();

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
                onClick: () => router.push("/dashboards"),
              },
              {
                text: "Custom fields",
                onClick: () => router.push("/dashboards/custom_fields"),
              },
              {
                text: "Info",
              },
            ]}
            truncate={false}
            aria-label="Custom fields info breadCrumb"
          />
        }
      >
        <>
          <GeneralDetails />
        </>
      </DashboardLayout>
    </>
  );
};

export default CustomFieldsInfo;
