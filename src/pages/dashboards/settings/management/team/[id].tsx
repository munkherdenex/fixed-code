import { EuiFlexGroup, EuiFlexItem, useGeneratedHtmlId } from "@elastic/eui";
import CreateSubTeam from "../../../../../components/management/create_sub_team";
import { InviteUserFlyoutContainer } from "../../../../../components/management/invite_user_flyout";
import MembersTable from "../../../../../components/management/members_table";
import ProductSelection from "../../../../../components/management/product_selection";
import TeamGeneralInfo, {
  TeamGeneralInfoTwo,
} from "../../../../../components/management/team_general_info";
import DashboardSettings from "../../../../../layouts/dashboard_settings";
import {
  ManagementTeamsProvider,
  useManagementTeamsContext,
} from "../../../../../store/management_teams_store";

const Information = () => {
  const { currentTeam, isAdmin } = useManagementTeamsContext();

  return (
    <DashboardSettings
      pageHeader={{
        pageTitle: `Team: ${currentTeam?.name}`,
        iconType: "managementApp",
        rightSideItems: [
          <CreateSubTeam key={useGeneratedHtmlId()} />,
          <InviteUserFlyoutContainer key={useGeneratedHtmlId()} />,
        ],
      }}
    >
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiFlexGroup>
            <EuiFlexItem>
              <TeamGeneralInfo />
            </EuiFlexItem>
            {isAdmin && (
              <EuiFlexItem grow={false}>
                <ProductSelection />
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem>
          <TeamGeneralInfoTwo />
        </EuiFlexItem>
        <EuiFlexItem>
          <MembersTable />
        </EuiFlexItem>
      </EuiFlexGroup>
    </DashboardSettings>
  );
};

const TeamInfo = () => {
  return (
    <ManagementTeamsProvider>
      <Information />
    </ManagementTeamsProvider>
  );
};

export default TeamInfo;
