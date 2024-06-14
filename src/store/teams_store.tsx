import { useRouter } from "next/router";
import { createContext, useCallback, useEffect, useState } from "react";
import useTeams from "../hooks/useTeams";
import { Initial_Teams_Type, Teams } from "./teams_store.types";

const initial_teams_state: Initial_Teams_Type = {
  teams: null,
  currentTeam: null,
  setCurrentTeam: () => {},
  changeCurrentTeam: () => {},
};

export const teamsContext = createContext(initial_teams_state);

export const TeamsProvider = ({ children }) => {
  const router = useRouter();
  const { data: teams, isLoading: teamsIsLoading, error: teamsError } = useTeams();
  const [currentTeam, setCurrentTeam] = useState<Teams | null>(null);

  const changeCurrentTeam = useCallback(
    (teamId: number) => {
      const team = teams.find((team) => team.id === teamId);
      if (team) {
        localStorage.setItem("currentTeamId", teamId.toString());
        setCurrentTeam(team);
      } else {
        setCurrentTeam(teams[0]);
      }
    },
    [teams],
  );

  useEffect(() => {
    if (teams?.length === 0 && !teamsIsLoading && !teamsError) {
      router.replace("/dashboards/team/create");
      return;
    }
    if (teams && !currentTeam) {
      const currentTeamId = localStorage.getItem("currentTeamId");
      if (currentTeamId && isNaN(+currentTeamId) === false) {
        const team = teams.find((team) => team.id === +currentTeamId);
        changeCurrentTeam(team?.id);
      } else {
        changeCurrentTeam(teams[0].id);
      }
    }
  }, [teams, router, teamsIsLoading, teamsError, currentTeam, changeCurrentTeam]);

  return (
    <teamsContext.Provider
      value={{
        teams,
        currentTeam,
        setCurrentTeam,
        changeCurrentTeam,
      }}
    >
      {children}
    </teamsContext.Provider>
  );
};
