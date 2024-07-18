import useSWR from "swr";
import { BASE_URL } from "../constants";
import { handleResponseNotOk } from "../utils/error_handler";
import { createParam } from "../utils/createParam";

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
  total_count: number;
  results: Channels[];
}

/**
 * Fetches the channels from the api
 * @param id - the id of the channels
 * @param queryParam - the query parameters
 * @returns the data, error, isLoading and mutate function
 */
export default function useGetChannels<Type>(
  id?: string | string[] | undefined,
  queryParam?: {
    [key: string]: string;
  },
): {
  data: Type;
  error: any;
  isLoading: boolean;
  mutate: () => Promise<Type>;
} {
  const path = id ? `/api/v1/dj/channels/${id}/` : `/api/v1/dj/channels/`;
  const preparedQueryParam = createParam(queryParam);

  const { data, error, isLoading, mutate } = useSWR(
    //INFO: slash needs to be added to the end of the path
    `${path}?${preparedQueryParam}`,
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
    mutate,
  };
}
