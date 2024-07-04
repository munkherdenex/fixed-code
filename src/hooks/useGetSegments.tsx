import useSWR from "swr";
import { BASE_URL } from "../constants";
import { handleResponseNotOk } from "../utils/error_handler";
import { createParam } from "../utils/createParam";

export interface Segment {
  created_at: string;
  created_by: number;
  description: string | null;
  id: number;
  name: string;
  team_id: string | null;
  type: string;
  updated_at: string;
  updated_by: number | null;
}

export interface SegmentResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Segment[];
}

export default function useGetSegments<Type>(
  id?: string | string[] | undefined,
  searchValue?: string,
): {
  data: Type;
  error: any;
  isLoading: boolean;
  mutate: () => Promise<Type>;
} {
  const path = id ? `/api/v1/dj/segments/${id}/` : `/api/v1/dj/segments/`;
  const queryParam = createParam({
    name: searchValue,
  });

  const { data, error, isLoading, mutate } = useSWR(
    //INFO: slash needs to be added to the end of the path
    `${path}?${queryParam}`,
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
