import { useRouter } from "next/router";
import { createContext, useCallback, useEffect, useState } from "react";
import { mutate } from "swr";
import useChangeTeam from "../hooks/useChangeTeam";
import useTeams from "../hooks/useTeams";
import { Initial_Teams_Type, Teams } from "./teams_store.types";

const initial_teams_state: Initial_Teams_Type = {
  teams: null,
  currentTeam: null,
  setCurrentTeam: () => {},
  changeCurrentTeam: () => {},
  clearCurrentTeam: () => {},
};

export const teamsContext = createContext(initial_teams_state);

export const TeamsProvider = ({ children }) => {
  const router = useRouter();
  const { trigger } = useChangeTeam();
  const { data: teams, isLoading: teamsIsLoading, error: teamsError } = useTeams();
  const [teamsData, setTeamsData] = useState<Teams[] | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Teams | null>(null);

  const changeCurrentTeam = useCallback(
    async (teamId: number) => {
      const team = teamsData.find((team) => team.id === teamId);
      if (team) {
        localStorage.setItem("currentTeamId", teamId.toString());
        try {
          await trigger({ team_id: teamId });
          console.log("wait team");
          setCurrentTeam(team);
        } catch {
          alert("error");
        }
      } else {
        setCurrentTeam(teamsData[0]);
      }
    },
    [teamsData, trigger],
  );

  const clearCurrentTeam = () => {
    setCurrentTeam(null);
    localStorage.removeItem("currentTeamId");
  };

  useEffect(() => {
    if (teams) {
      setTeamsData(teams);
    }
  }, [teams]);

  useEffect(() => {
    if (teamsData?.length === 0 || !teamsData) {
      setCurrentTeam(null);
    }
    if (teamsData?.length === 0 && !teamsIsLoading && !teamsError) {
      router.replace("/dashboards/team/create");
      return;
    }
    if (teamsData && !currentTeam) {
      const currentTeamId = localStorage.getItem("currentTeamId");
      if (currentTeamId && isNaN(+currentTeamId) === false) {
        const team = teamsData.find((team) => team.id === +currentTeamId);
        changeCurrentTeam(team?.id);
      } else {
        changeCurrentTeam(teamsData[0].id);
      }
    }
  }, [teamsData, router, teamsIsLoading, teamsError, currentTeam, changeCurrentTeam]);

  useEffect(() => {
    //TODO: buh fetch huselt dahin duudagdana currentTeam uurchlugduh uyed
    mutate("/api/v1/dj/segments/");
  }, [currentTeam]);

  return (
    <teamsContext.Provider
      value={{
        teams,
        currentTeam,
        setCurrentTeam,
        changeCurrentTeam,
        clearCurrentTeam,
      }}
    >
      {children}
    </teamsContext.Provider>
  );
};
