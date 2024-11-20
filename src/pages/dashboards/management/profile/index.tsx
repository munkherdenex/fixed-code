import Head from "next/head";
import DashboardLayout from "../../../../layouts/dashboard";
import ManagementProfileTabs from "../../../../components/management/management_profile_tabs";

const Management = () => {
  return (
    <>
      <Head>
        <title>Management</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Profile settings",
          iconType: "managementApp",
        }}
      >
        <>
          <ManagementProfileTabs />
        </>
      </DashboardLayout>
    </>
  );
};

export default Management;
