import { EuiFlexGroup, EuiFlexItem, useGeneratedHtmlId } from "@elastic/eui";
import { useTranslations } from "next-intl";
import { GetStaticProps } from "next/types";
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
  const translate = useTranslations();

  const { currentTeam, isAdmin } = useManagementTeamsContext();

  return (
    <DashboardSettings
      pageHeader={{
        pageTitle: translate("team_name", {
          name: currentTeam?.name,
        }),
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

export async function getStaticPaths() {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
}

export const getStaticProps: GetStaticProps = async (context) => {
  const teams = (await import(`../../../../../messages/${context.locale}/teams.json`)).default;
  const common = (await import(`../../../../../messages/${context.locale}/common.json`)).default;

  return {
    props: {
      messages: {
        ...teams,
        ...common,
      },
    },
  };
};

export default TeamInfo;
