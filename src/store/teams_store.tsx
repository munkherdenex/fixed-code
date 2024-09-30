import { useRouter } from "next/router";
import { createContext, useCallback, useEffect, useState } from "react";
import { mutate } from "swr";
import GlobalLoading from "../components/global-loading";
import useChangeTeam from "../hooks/useChangeTeam";
import useGetTeamsMyprofile, { TeamsMyProfileResponse } from "../hooks/useGetTeamsMyprofile";
import useTeams from "../hooks/useTeams";
import { Initial_Teams_Type, Teams } from "./teams_store.types";

const initial_teams_state: Initial_Teams_Type = {
  teams: null,
  currentTeam: null,
  myProfile: null,
  setCurrentTeam: () => {},
  changeCurrentTeam: () => {},
  clearCurrentTeam: () => {},
};

export const teamsContext = createContext(initial_teams_state);

export const TeamsProvider = ({ children }) => {
  const router = useRouter();
  const { trigger } = useChangeTeam();
  const [currentTeam, setCurrentTeam] = useState<Teams | null>(null);

  const { data: teams, isLoading: teamsIsLoading } = useTeams();
  const { data: myProfile, isLoading: profileIsLoading } =
    useGetTeamsMyprofile<TeamsMyProfileResponse | null>(currentTeam?.id?.toString());

  const changeCurrentTeam = useCallback(
    async (teamId: number) => {
      if (teams.length === 0) {
        return;
      }

      const team = teams.find((team) => team.id === teamId);

      if (team) {
        localStorage.setItem("currentTeamId", teamId.toString());

        try {
          const response = await trigger({ team_id: teamId });
          if (response) {
            setCurrentTeam(team);
          }
        } catch {
          alert("Refresh site");
        }
        return;
      }

      if (!team) {
        const parentTeam = teams.find((team) => team.parent_id === null);
        localStorage.setItem("currentTeamId", parentTeam?.id.toString());
        setCurrentTeam(parentTeam);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [teams, trigger],
  );

  const clearCurrentTeam = () => {
    setCurrentTeam(null);
    localStorage.removeItem("currentTeamId");
  };

  useEffect(() => {
    if (!router.pathname.includes("dashboards")) {
      return;
    }

    if (!teams) {
      return;
    }

    if (teams.length === 0 && !router.pathname.includes("/dashboards/team/create")) {
      router.replace("/dashboards/team/create");
      return;
    }

    const parentTeam = teams.find((team) => team.parent_id === null);

    if (!parentTeam && !router.pathname.includes("/dashboards/team/create")) {
      router.replace("/dashboards/team/create");
      return;
    }

    if (!currentTeam) {
      const teamId = +localStorage.getItem("currentTeamId");
      if (!isNaN(teamId)) {
        changeCurrentTeam(teamId);
      } else {
        changeCurrentTeam(parentTeam?.id);
      }
    }

    return () => {
      setCurrentTeam(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams]);

  useEffect(() => {
    //INFO: currentTeam uurchlugduh uyed teams profile-aas busdiig n dahij shinechlene
    mutate(
      (key) => {
        if (key === "/api/v1/teams" || key === "/api/v1/profile") {
          return false;
        }
        return true;
      }, // which cache keys are updated
      undefined, // update cache data to `undefined`
      { revalidate: true }, // do not revalidate
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTeam]);

  return (
    <teamsContext.Provider
      value={{
        teams,
        currentTeam,
        myProfile,
        setCurrentTeam,
        changeCurrentTeam,
        clearCurrentTeam,
      }}
    >
      {(teamsIsLoading || profileIsLoading) && !router.pathname.includes("team/create") ? (
        <GlobalLoading />
      ) : (
        children
      )}
    </teamsContext.Provider>
  );
};
