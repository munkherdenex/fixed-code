import Head from "next/head";
import Sidebar from "../../../../components/management/sidebar";
import DashboardLayout from "../../../../layouts/dashboard";
import { EuiButton } from "@elastic/eui";
import { useState } from "react";
import ApiKeysTable from "../../../../components/api_keys/table";
import CreateAPIKeysComponent from "../../../../components/api_keys/create_api_keys";

const ApiKeys = () => {
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  return (
    <>
      <Head>
        <title>Management</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Api keys",
          iconType: "managementApp",
          rightSideItems: [
            <EuiButton
              color="primary"
              onClick={() => setIsFlyoutVisible(true)}
              fill
              key="create-api-key"
            >
              Create API Key
            </EuiButton>,
          ],
        }}
        sidebar={<Sidebar active="api-keys" />}
      >
        <div>
          <ApiKeysTable />
          {isFlyoutVisible && <CreateAPIKeysComponent setIsFlyoutVisible={setIsFlyoutVisible} />}
        </div>
      </DashboardLayout>
    </>
  );
};
export default ApiKeys;
