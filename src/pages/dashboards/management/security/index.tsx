import Head from "next/head";
import SecurityComponent from "../../../../components/management/security";
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
      >
        <SecurityComponent />
      </DashboardLayout>
    </>
  );
};

export default Security;
