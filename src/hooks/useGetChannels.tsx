import useSWR from "swr";
import { BASE_URL } from "../constants";
import { useRouter } from "next/router";
import { handleResponseNotOk } from "../utils/error_handler";

export interface Channels {
  id: number;
  data: string;
  created_at: string;
  updated_at: string;
  name: string;
  channel_type: string;
  team_id: string;
  created_by: number;
  updated_by: number;
}

export interface ChannelsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Channels[];
}

export default function useGetChannels<Type>(id?: string | string[] | undefined): {
  data: Type;
  error: any;
  isLoading: boolean;
} {
  const router = useRouter();
  const path = id ? `/api/v1/dj/channels/${id}/` : `/api/v1/dj/channels/`;
  const { data, error, isLoading } = useSWR(
    //INFO: slash needs to be added to the end of the path
    router.pathname.includes("dashboard") ? path : null,
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
