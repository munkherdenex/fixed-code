import { useRouter } from "next/router";
import { createContext, useContext } from "react";
import useGetTeamsMyprofile, { TeamsMyProfileResponse } from "../hooks/useGetTeamsMyprofile";
import useTeams from "../hooks/useTeams";
import { isNumber } from "../utils/helper";
import { Teams } from "./teams_store.types";

const initialSegmentState: {
  currentTeam: Teams | null;
  myProfile: TeamsMyProfileResponse | null;
  isAdmin: boolean;
  isManager: boolean;
  isMember: boolean;
  refetchTeam: () => void;
} = {
  currentTeam: undefined,
  myProfile: undefined,
  isAdmin: false,
  isManager: false,
  isMember: false,
  refetchTeam: () => {},
};

export const managementTeamsContext = createContext(initialSegmentState);

export const useManagementTeamsContext = () => {
  return useContext(managementTeamsContext);
};

export const ManagementTeamsProvider = ({ children }) => {
  const router = useRouter();
  const id = isNumber(router.query.id) ? router.query.id : "";
  const { data, mutate } = useTeams<Teams>(id.toString(), {
    parent_team: "True",
  });

  const { data: myProfile } = useGetTeamsMyprofile<TeamsMyProfileResponse | null>(
    data?.id ? data?.id?.toString() : null,
  );

  const isAdmin = myProfile?.role === "admin";
  const isManager = myProfile?.role === "manager";
  const isMember = myProfile?.role === "member";

  return (
    <managementTeamsContext.Provider
      value={{ currentTeam: data, myProfile, isAdmin, isManager, isMember, refetchTeam: mutate }}
    >
      {children}
    </managementTeamsContext.Provider>
  );
};
