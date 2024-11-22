import Head from "next/head";
import DashboardSettings from "../../../../../layouts/dashboard_settings";
import ManagementProfileTabs from "../../../../../components/management/management_profile_tabs";
import { useContext } from "react";
import { teamsContext } from "../../../../../store/teams_store";

const Management = () => {
  const { teams } = useContext(teamsContext);

  return (
    <>
      <Head>
        <title>Management</title>
      </Head>
      <DashboardSettings
        pageHeader={{
          pageTitle: "Profile settings",
          iconType: "managementApp",
        }}
        hideSidebar={teams?.length === 0}
      >
        <>
          <ManagementProfileTabs />
        </>
      </DashboardSettings>
    </>
  );
};

export default Management;
