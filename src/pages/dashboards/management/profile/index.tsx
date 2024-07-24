import Head from "next/head";
import Settings from "../../../../components/management/settings";
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
      >
        <Settings />
      </DashboardLayout>
    </>
  );
};

export default Management;
