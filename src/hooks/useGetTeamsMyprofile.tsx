import useSWRImmutable from "swr/immutable";
import { BASE_URL } from "../constants";
import { handleResponseNotOk } from "../utils/error_handler";

export interface TeamsMyProfileResponse {
  id: number;
  user: {
    email: string;
    fname: string;
    lname: string;
    registered_date: string;
  };
  role: string;
  status: string;
  joined_date: string | null;
}

export default function useGetTeamsMyprofile<Type>(currentTeamId?: string): {
  data: Type;
  error: any;
  isLoading: boolean;
} {
  const path = currentTeamId ? `/api/v1/teams/${currentTeamId}/myprofile` : null;

  const { data, error, isLoading } = useSWRImmutable(
    //INFO: slash needs to be added to the end of the path
    path,
    async (path) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "GET",
        headers: { "content-type": "application/json" },
        credentials: "include",
      });

      return handleResponseNotOk(res);
    },
  );

  return {
    data,
    error,
    isLoading,
  };
}
