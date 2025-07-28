import useSWR from "swr";
import { BASE_URL } from "../constants";
import { handleResponseNotOk } from "../utils/error_handler";
import { Teams } from "../store/teams_store.types";

export default function useGetAllWorkers<Type>(currentTeam: Teams): {
  data: Type;
  error: any;
  isLoading: boolean;
  mutateAllWorkers: any;
} {
  const url = currentTeam?.id ? `/api/v1/teams/${currentTeam?.id}/?workers=true` : null;
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
    mutateAllWorkers: mutate,
  };
}
