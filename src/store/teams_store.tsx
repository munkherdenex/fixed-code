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
  const [teamsData, setTeamsData] = useState<Teams[] | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Teams | null>(null);
  const [globalLoading, setGlobalLoading] = useState<boolean>(false);

  const { data: teams, isLoading: teamsIsLoading, error: teamsError } = useTeams();
  const { data: myProfile, isLoading: profileIsLoading } =
    useGetTeamsMyprofile<TeamsMyProfileResponse | null>(currentTeam?.id?.toString());

  //INFO: idk what is going on here
  const changeCurrentTeam = useCallback(
    async (teamId: number) => {
      setGlobalLoading(true);
      const team = teamsData.find((team) => team.id === teamId);
      if (team) {
        localStorage.setItem("currentTeamId", teamId.toString());
        try {
          await trigger({ team_id: teamId });
          if (window.location.pathname.includes("/info/")) await router.replace("/dashboards");
          setCurrentTeam(team);
        } catch {
          alert("error");
        }
      } else {
        setCurrentTeam(teamsData[0]);
      }
      setGlobalLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [teamsData, trigger],
  );

  const clearCurrentTeam = () => {
    setTeamsData(null);
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
    if (
      teamsData?.length === 0 &&
      !teamsIsLoading &&
      !teamsError &&
      router.pathname !== "/dashboards/team/create"
    ) {
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
      {(teamsIsLoading || profileIsLoading || globalLoading) &&
      !router.pathname.includes("team/create") ? (
        <GlobalLoading />
      ) : (
        children
      )}
    </teamsContext.Provider>
  );
};
