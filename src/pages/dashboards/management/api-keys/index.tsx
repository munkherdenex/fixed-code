import Head from "next/head";
import Sidebar from "../../../../components/management/sidebar";
import DashboardLayout from "../../../../layouts/dashboard";

const ApiKeys = () => {
  return (
    <>
      <Head>
        <title>Management</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Api keys",
          iconType: "managementApp",
        }}
        sidebar={<Sidebar active="api-keys" />}
      >
        <div>api-keys</div>
      </DashboardLayout>
    </>
  );
};
export default ApiKeys;
