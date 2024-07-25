import useSWR from "swr";
import { BASE_URL } from "../constants";
import { handleResponseNotOk } from "../utils/error_handler";

export interface ApiKeysType {
  id: string | number;
  name: string;
  kid: string;
  created_at: Date;
  expires_at: Date | null;
  data: string;
  team_name: string;
}

export default function useGetAPIKeys() {
  const { data, error, isLoading, mutate } = useSWR("/api/v1/apikey", async (path) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: { "content-type": "application/json" },
      credentials: "include",
    });

    return handleResponseNotOk(res);
  });

  return {
    data: (data as ApiKeysType[]) || [],
    error,
    isLoading,
    mutate,
  };
}
