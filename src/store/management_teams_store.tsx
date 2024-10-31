import { createContext, useContext, useLayoutEffect, useMemo, useState } from "react";
import useGetTeamsMyprofile, { TeamsMyProfileResponse } from "../hooks/useGetTeamsMyprofile";
import useTeams from "../hooks/useTeams";
import { Teams } from "./teams_store.types";

const initialSegmentState: {
  data: Teams[] | null;
  currentTeam: Teams | null;
  changeCurrentTeam: (teamId: number) => void;
  myProfile: TeamsMyProfileResponse | null;
  isAdmin: boolean;
  isManager: boolean;
  isMember: boolean;
} = {
  data: undefined,
  currentTeam: undefined,
  changeCurrentTeam: (_teamId: number) => {},
  myProfile: undefined,
  isAdmin: false,
  isManager: false,
  isMember: false,
};

export const managementTeamsContext = createContext(initialSegmentState);

export const useManagementTeamsContext = () => {
  return useContext(managementTeamsContext);
};

export const ManagementTeamsProvider = ({ children }) => {
  const { data: teams } = useTeams();
  const data = useMemo(() => teams, [teams]);

  const [currentTeam, setCurrentTeam] = useState(
    Array.isArray(teams) && teams.length > 0 ? teams?.[0] : null,
  );

  const { data: myProfile } = useGetTeamsMyprofile<TeamsMyProfileResponse | null>(
    currentTeam?.id ? currentTeam?.id?.toString() : null,
  );

  const isAdmin = myProfile?.role === "admin";
  const isManager = myProfile?.role === "manager";
  const isMember = myProfile?.role === "member";

  const changeCurrentTeam = (teamId: number) => {
    const team = teams.find((team) => team.id === teamId);
    if (!team) return;
    setCurrentTeam(team);
  };

  useLayoutEffect(() => {
    setCurrentTeam(Array.isArray(teams) && teams.length > 0 ? teams?.[0] : null);
  }, [teams]);

  return (
    <managementTeamsContext.Provider
      value={{ data, currentTeam, changeCurrentTeam, myProfile, isAdmin, isManager, isMember }}
    >
      {children}
    </managementTeamsContext.Provider>
  );
};
