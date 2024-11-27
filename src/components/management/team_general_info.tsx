import {
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiStat,
  EuiTextArea,
  EuiTextColor,
  EuiTimeline,
} from "@elastic/eui";
import { useRouter } from "next/router";
import { useContext, useMemo, useState } from "react";
import { useManagementTeamsContext } from "../../store/management_teams_store";
import { teamsContext } from "../../store/teams_store";
import { convertToTree } from "../../utils/convertToTree";
import useUpdateTeamName from "../../hooks/useUpdateTeamName";

const TeamGeneralInfo = () => {
  const { currentTeam, isAdmin, refetchTeam } = useManagementTeamsContext();
  const { trigger } = useUpdateTeamName(currentTeam?.id.toString());

  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(currentTeam?.name);
  const [description, setDescription] = useState(currentTeam?.description);

  const handleSave = async () => {
    try {
      await trigger({
        name: name || currentTeam?.name,
        description: description || currentTeam?.description,
        admin_id: currentTeam?.admin_id,
      });
      refetchTeam();
      setEdit(!edit);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <EuiPanel>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <EuiPanel paddingSize="s" color="subdued">
              <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
                <EuiFlexItem grow={false}>Team info</EuiFlexItem>
                {isAdmin && (
                  <EuiFlexItem grow={false}>
                    {edit ? (
                      <EuiFlexGroup gutterSize="none">
                        <EuiFlexItem>
                          <EuiButtonIcon
                            iconType="cross"
                            color="danger"
                            size="s"
                            onClick={() => {
                              setEdit(!edit);
                            }}
                          />
                        </EuiFlexItem>
                        <EuiFlexItem>
                          <EuiButtonIcon
                            iconType="save"
                            color="success"
                            size="s"
                            onClick={() => {
                              handleSave();
                            }}
                          />
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    ) : (
                      <EuiButtonIcon
                        iconType="pencil"
                        color="primary"
                        size="s"
                        onClick={() => {
                          setEdit(!edit);
                        }}
                      />
                    )}
                  </EuiFlexItem>
                )}
              </EuiFlexGroup>
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiPanel hasBorder={true}>
                  <EuiStat
                    title={
                      edit ? (
                        <EuiFieldText
                          placeholder="Enter team name"
                          value={name || currentTeam?.name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      ) : (
                        currentTeam?.name
                      )
                    }
                    description={
                      <EuiTextColor color="default">
                        <span>Name</span>
                      </EuiTextColor>
                    }
                    titleSize="xs"
                  />
                </EuiPanel>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiPanel hasBorder={true}>
                  <EuiStat
                    title={
                      edit ? (
                        <EuiTextArea
                          style={{
                            height: "40px",
                          }}
                          placeholder="Enter team description"
                          value={description || currentTeam?.description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      ) : currentTeam?.description ? (
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
                </EuiPanel>
              </EuiFlexItem>
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
