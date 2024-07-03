import useSWR from "swr";
import { BASE_URL } from "../constants";
import { useContext } from "react";
import { teamsContext } from "../store/teams_store";
import { handleResponseNotOk } from "../utils/error_handler";

export default function useGetCurrentTeamMembers<Type>(): {
  data: Type;
  error: any;
  isLoading: boolean;
  mutate: any;
} {
  const { currentTeam } = useContext(teamsContext);
  const url = currentTeam?.id ? `/api/v1/teams/${currentTeam?.id}/?members=true` : null;
  const { data, error, isLoading, mutate } = useSWR(url, async (path) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: { "content-type": "application/json" },
      credentials: "include",
    });

    return handleResponseNotOk(res);
  });

  return {
    data: data,
    error,
    isLoading,
    mutate,
  };
}
