import { EuiButton } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import TeamsTable from "../../../../components/management/teams_table";
import { IS_POCKET } from "../../../../constants";
import DashboardSettings from "../../../../layouts/dashboard_settings";

const Management = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Management</title>
      </Head>
      <DashboardSettings
        pageHeader={{
          pageTitle: "Teams",
          iconType: "managementApp",
          rightSideItems: [
            !IS_POCKET && (
              <EuiButton
                color="primary"
                key="create-team-button"
                fill
                onClick={() => router.push("/dashboards/settings/team/create")}
              >
                Create team
              </EuiButton>
            ),
          ],
        }}
      >
        <TeamsTable />
      </DashboardSettings>
    </>
  );
};

export default Management;
