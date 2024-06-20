import Head from "next/head";
import Settings from "../../../../components/management/settings";
import Sidebar from "../../../../components/management/sidebar";
import DashboardLayout from "../../../../layouts/dashboard";

const Management = () => {
  return (
    <>
      <Head>
        <title>Management</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Settings",
          iconType: "managementApp",
        }}
        sidebar={<Sidebar active="settings" />}
      >
        <Settings />
      </DashboardLayout>
    </>
  );
};

export default Management;
