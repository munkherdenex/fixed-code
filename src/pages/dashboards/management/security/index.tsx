import Head from "next/head";
import SecurityComponent from "../../../../components/management/security";
import Sidebar from "../../../../components/management/sidebar";
import DashboardLayout from "../../../../layouts/dashboard";

const Security = () => {
  return (
    <>
      <Head>
        <title>Security</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Security",
          iconType: "managementApp",
        }}
        sidebar={<Sidebar active="security" />}
      >
        <SecurityComponent />
      </DashboardLayout>
    </>
  );
};

export default Security;
