import { EuiFlexGroup, EuiFlexItem, EuiPanel } from "@elastic/eui";
import Head from "next/head";
import TeamsTreeView from "../../../components/management/teams_tree_view";
import TeamMembersComponent from "../../../components/management/team_members";
import DashboardLayout from "../../../layouts/dashboard";

const Management = () => {
  return (
    <>
      <Head>
        <title>Management</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Team members",
          iconType: "managementApp",
        }}
      >
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <EuiPanel>
              <TeamsTreeView />
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <TeamMembersComponent />
          </EuiFlexItem>
        </EuiFlexGroup>
      </DashboardLayout>
    </>
  );
};

export default Management;
