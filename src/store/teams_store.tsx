import { useRouter } from "next/router";
import { createContext, useCallback, useEffect, useState } from "react";
import { mutate } from "swr";
import GlobalLoading from "../components/global-loading";
import useChangeTeam from "../hooks/useChangeTeam";
import useGetAvailableProduct, { Product } from "../hooks/useGetAvailableProduct";
import useGetTeamsMyprofile, { TeamsMyProfileResponse } from "../hooks/useGetTeamsMyprofile";
import useTeams from "../hooks/useTeams";
import { isNumber } from "../utils/helper";
import { Initial_Teams_Type, Teams } from "./teams_store.types";

const initial_teams_state: Initial_Teams_Type = {
  teamProducts: null,
  teams: null,
  currentTeam: null,
  myProfile: null,
  setCurrentTeam: () => {},
  changeCurrentTeam: () => {},
  clearCurrentTeam: () => {},
  isAdmin: false,
  isManager: false,
  isMember: false,
  isAccountActive: false,
  isCDPEnabled: false,
  isCRMEnabled: false,
};

export const teamsContext = createContext(initial_teams_state);

export const TeamsProvider = ({ children }) => {
  const router = useRouter();

  const [currentTeam, setCurrentTeam] = useState<Teams | null>(null);

  const { trigger } = useChangeTeam();
  const { data: teams, isLoading: teamsIsLoading, error: teamError } = useTeams<Teams[]>(null, {});
  const { data: products, isLoading: isProductsLoading } = useGetAvailableProduct<Product[]>(
    currentTeam?.id.toString(),
  );

  const {
    data: myProfile,
    isLoading: profileIsloading,
    error: profileError,
  } = useGetTeamsMyprofile<TeamsMyProfileResponse | null>(
    currentTeam?.id ? currentTeam?.id?.toString() : null,
  );

  const isGlobalLoading =
    teamsIsLoading ||
    profileIsloading ||
    isProductsLoading ||
    teams === undefined ||
    (teams.length > 0 && myProfile === undefined) ||
    (currentTeam?.id && myProfile === undefined);

  const isAdmin = myProfile?.role === "admin";
  const isManager = myProfile?.role === "manager";
  const isMember = myProfile?.role === "member";
  const isAccountActive = myProfile?.status === "active";
  const isCDPEnabled = !!products?.find((product) => product?.name === "CDP");
  const isCRMEnabled = !!products?.find((product) => product?.name === "CRM");

  const changeCurrentTeam = useCallback(
    async (teamId: number) => {
      if (teams.length === 0) {
        return;
      }

      const team = teams?.find((team) => {
        if (team) return team?.id === teamId;
      });

      if (team) {
        localStorage.setItem("currentTeamId", teamId.toString());
        const response = await trigger({ team_id: teamId });
        if (response) {
          setCurrentTeam(team);
        }
      }
    },
    [teams, trigger],
  );

  const clearCurrentTeam = () => {
    setCurrentTeam(null);
    localStorage.removeItem("currentTeamId");
  };

  useEffect(() => {
    if (teamsIsLoading) {
      return;
    }
    if (!router.pathname.includes("dashboards")) {
      return;
    }

    if (!teams) {
      return;
    }

    if (teams?.length === 0) {
      return;
    }

    if (!currentTeam) {
      const teamId = +localStorage.getItem("currentTeamId");
      if (isNumber(teamId)) {
        const team = teams?.find((team) => {
          if (team) return team.id === teamId;
        });
        if (team) {
          changeCurrentTeam(team?.id);
        }
        if (!team) {
          changeCurrentTeam(teams?.[0]?.id);
        }
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
        const stringKey = key?.toString();
        if (stringKey?.includes("/api/v1/teams") || stringKey?.includes("/api/v1/profile")) {
          return false;
        }
        return true;
      }, // which cache keys are updated
      undefined, // update cache data to `undefined`
      { revalidate: true }, // do not revalidate
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTeam]);

  useEffect(() => {
    console.log(teamError);
    console.log(profileError);
  }, [teamError, profileError]);

  return (
    <teamsContext.Provider
      value={{
        teamProducts: products,
        teams,
        currentTeam,
        myProfile,
        setCurrentTeam,
        changeCurrentTeam,
        clearCurrentTeam,
        isAdmin,
        isManager,
        isMember,
        isAccountActive,
        isCDPEnabled,
        isCRMEnabled,
      }}
    >
      {isGlobalLoading && router.pathname.includes("dashboards") ? <GlobalLoading /> : children}
    </teamsContext.Provider>
  );
};
