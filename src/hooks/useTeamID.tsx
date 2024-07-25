import useSWRImmutable from "swr/immutable";
import { BASE_URL } from "../constants";
import { Teams } from "../store/teams_store.types";
import { handleResponseNotOk } from "../utils/error_handler";

export default function useTeamID(): {
  data: Teams[];
  error: any;
  isLoading: boolean;
} {
  const { data, error, isLoading } = useSWRImmutable(`/api/v1/teams`, async (path) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: { "content-type": "application/json" },
      credentials: "include",
    });

    return handleResponseNotOk(res);
  });

  return {
    data,
    error,
    isLoading,
  };
}
