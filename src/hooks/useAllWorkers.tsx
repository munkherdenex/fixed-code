import useSWR from "swr";
import { BASE_URL } from "../constants";
import { handleResponseNotOk } from "../utils/error_handler";
import { Teams } from "../store/teams_store.types";

export default function useAllWorkers<Type>(currentTeamId: string): {
  data: Type | undefined;
  error: any;
  isLoading: boolean;
  mutateAllWorkers: any;
} {
  const url = currentTeamId ? `/api/v1/teams/${currentTeamId}/?workers=true` : null;

  console.log(" useAllWorkers hook: currentTeam =", currentTeamId);
  console.log(" useAllWorkers hook: final URL =", url);

  const { data, error, mutate, isLoading } = useSWR(url, async (path) => {
    console.log("🌐 Fetching workers from:", `${BASE_URL}${path}`);
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: { "content-type": "application/json" },
      credentials: "include",
    });

    return handleResponseNotOk(res);
  });

  if (error) {
    console.error(" useAllWorkers: Error fetching workers:", error);
  }

  return {
    data,
    error,
    isLoading,
    mutateAllWorkers: mutate,
  };
}
