import Head from "next/head";
import SecurityComponent from "../../../../../components/management/security";
import DashboardSettings from "../../../../../layouts/dashboard_settings";

const Security = () => {
  return (
    <>
      <Head>
        <title>Security</title>
      </Head>
      <DashboardSettings
        pageHeader={{
          pageTitle: "Security",
          iconType: "managementApp",
        }}
      >
        <SecurityComponent />
      </DashboardSettings>
    </>
  );
};

export default Security;
