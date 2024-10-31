import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiPanel } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import InviteUserFlyout from "../../../components/management/invite_user_flyout";
import ManagementTeamsTreeView from "../../../components/management/managemenet_teams_tree_view";
import MembersTable from "../../../components/management/members_table";
import DashboardLayout from "../../../layouts/dashboard";
import {
  ManagementTeamsProvider,
  useManagementTeamsContext,
} from "../../../store/management_teams_store";

const CreateSubTeam = () => {
  const router = useRouter();
  const { currentTeam, isAdmin } = useManagementTeamsContext();

  const isParentTeam = currentTeam?.parent_id === null;

  if (isAdmin && isParentTeam) {
    return (
      <EuiFlexItem>
        <EuiButton
          onClick={async () => {
            if (isAdmin) {
              router.push({
                pathname: "/dashboards/team/sub/create",
                query: { id: currentTeam?.id },
              });
            }
          }}
        >
          Create sub team
        </EuiButton>
      </EuiFlexItem>
    );
  }

  return null;
};

const InviteUser = () => {
  const { isAdmin } = useManagementTeamsContext();
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  if (isAdmin) {
    return (
      <>
        <EuiButton onClick={() => setIsFlyoutVisible(true)}>Invite user</EuiButton>
        {isFlyoutVisible && isAdmin && <InviteUserFlyout setIsFlyoutVisible={setIsFlyoutVisible} />}
      </>
    );
  }

  return null;
};

const Management = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Management</title>
      </Head>
      <ManagementTeamsProvider>
        <DashboardLayout
          pageHeader={{
            pageTitle: "Team members",
            iconType: "managementApp",
            rightSideItems: [
              <InviteUser key="invite-user" />,
              <EuiButton
                color="primary"
                key="create-team-button"
                fill
                onClick={() => router.push("/dashboards/team/create")}
              >
                Create team
              </EuiButton>,
            ],
          }}
        >
          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
              <div>
                <EuiPanel>
                  <EuiFlexGroup direction="column">
                    <EuiFlexItem>
                      <ManagementTeamsTreeView />
                    </EuiFlexItem>
                    <CreateSubTeam />
                  </EuiFlexGroup>
                </EuiPanel>
              </div>
            </EuiFlexItem>
            <EuiFlexItem>
              <div>
                <MembersTable />
              </div>
            </EuiFlexItem>
          </EuiFlexGroup>
        </DashboardLayout>
      </ManagementTeamsProvider>
    </>
  );
};

export default Management;
