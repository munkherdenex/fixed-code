import useSWR from "swr";
import { BASE_URL } from "../constants";
import { useContext, useEffect } from "react";
import { addToast } from "../components/toast";
import { teamsContext } from "../store/teams_store";

export default function useGetCurrentTeamMembers() {
  const { currentTeam } = useContext(teamsContext);

  const url = currentTeam?.id ? `/api/v1/teams/${currentTeam?.id}/?members=true` : null;
  const { data, error, isLoading, mutate } = useSWR(
    url,
    async (path) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "GET",
        headers: { "content-type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        const error = new Error(data?.error);
        error.status = res.status;
        throw error;
      }
      return res.json();
    },
  );

  useEffect(() => {
    if (error) {
      addToast({
        id: "team-members-error",
        color: "danger",
        title: "An error occurred",
        text: error?.message,
      });
    }
  }, [error]);

  return {
    data: (data) || [],
    team_members: (data),
    error,
    isLoading,
    mutate,
  };
}
