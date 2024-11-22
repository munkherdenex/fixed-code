import {
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiStat,
  EuiTextColor,
  EuiTimeline,
} from "@elastic/eui";
import { useRouter } from "next/router";
import { useContext, useMemo } from "react";
import { useManagementTeamsContext } from "../../store/management_teams_store";
import { teamsContext } from "../../store/teams_store";
import { convertToTree } from "../../utils/convertToTree";
import useUpdateTeamName from "../../hooks/useUpdateTeamName";

const TeamGeneralInfo = () => {
  const router = useRouter();
  const { currentTeam } = useManagementTeamsContext();
  const { trigger } = useUpdateTeamName(router?.query?.id);

  const update = () => {
    trigger({
      name: "Pocket-ийн баг",
      description: "",
      admin_id: 1,
    });
  };

  return (
    <>
      <EuiPanel>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <EuiPanel paddingSize="s" color="subdued">
              <EuiFlexGroup justifyContent="spaceBetween">
                <EuiFlexItem grow={false}>Team info</EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiFlexItem grow={false}>
                    <EuiButtonIcon
                      display="base"
                      iconType="pencil"
                      aria-label="Update"
                      color="primary"
                      onClick={() => update()}
                    />
                  </EuiFlexItem>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGroup alignItems="center">
              <EuiPanel hasBorder={true}>
                <EuiFlexItem>
                  <EuiStat
                    title={currentTeam?.name}
                    description={
                      <EuiTextColor color="default">
                        <span>Name</span>
                      </EuiTextColor>
                    }
                    titleSize="xs"
                  />
                </EuiFlexItem>
              </EuiPanel>

              <EuiPanel hasBorder={true} style={{ height: "100%" }}>
                <EuiFlexItem>
                  <EuiStat
                    title={
                      currentTeam?.description ? (
                        currentTeam?.description
                      ) : (
                        <EuiTextColor color="subdued">No description</EuiTextColor>
                      )
                    }
                    description={
                      <EuiTextColor color="default">
                        <span>Description</span>
                      </EuiTextColor>
                    }
                    titleSize="xs"
                  />
                </EuiFlexItem>
              </EuiPanel>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </>
  );
};

export const TeamGeneralInfoTwo = () => {
  const router = useRouter();
  const { currentTeam } = useManagementTeamsContext();
  const { teams, changeCurrentTeam } = useContext(teamsContext);

  const subTeams = useMemo(
    () =>
      convertToTree(teams, changeCurrentTeam, currentTeam).filter(
        (item) => item.id === currentTeam?.id?.toString(),
      )?.[0]?.children,
    [teams, currentTeam, changeCurrentTeam],
  );

  const parentItems = [
    {
      icon: "folderClosed",
      onClick: () => {
        router.push(`/dashboards/settings/management/team/${currentTeam?.parent_team?.id}`);
      },
      children: (
        <EuiButtonEmpty color="text" size="s">
          <p>{currentTeam?.parent_team?.name}</p>
        </EuiButtonEmpty>
      ),
    },
  ];

  const subItems = subTeams?.map((subTeam) => {
    return {
      icon: "submodule",
      onClick: () => {
        router.push(`/dashboards/settings/management/team/${subTeam?.id}`);
      },
      children: (
        <EuiButtonEmpty color="text" size="s">
          <p>{subTeam?.label}</p>
        </EuiButtonEmpty>
      ),
    };
  });

  if (currentTeam?.parent_team) {
    return (
      <EuiPanel>
        <EuiPanel color="subdued" paddingSize="s">
          Parent team:
          <EuiButtonEmpty
            onClick={() =>
              router.push(`/dashboards/settings/management/team/${currentTeam?.parent_team?.id}`)
            }
          >
            {currentTeam?.parent_team?.name}
          </EuiButtonEmpty>
        </EuiPanel>
      </EuiPanel>
    );
  }

  if (subItems?.length > 0) {
    return (
      <EuiPanel>
        <EuiStat
          title={
            <>
              <EuiSpacer size="l" />
              <EuiTimeline items={subItems} aria-label="Project sub teams" />
            </>
          }
          description={
            <EuiPanel color="subdued" paddingSize="s">
              <span>Sub teams</span>
            </EuiPanel>
          }
          titleSize="xs"
        />
      </EuiPanel>
    );
  }

  return;
};

export default TeamGeneralInfo;
