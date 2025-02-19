import useSWR from "swr";
import { BASE_URL } from "../constants";
import { handleResponseNotOk } from "../utils/error_handler";
import { createParam } from "../utils/createParam";
import { Worker } from '@/lib/types';

export interface Segment {
  created_at: string;
  created_by: Worker | null;
  description: string | null;
  id: number;
  name: string;
  team_id: string | null;
  type: string;
  updated_at: string;
  updated_by: Worker | null;
  condition: string;
  status: string;
  retarget_template_id: number | null;
}

export interface SegmentResponse {
  total_count: number;
  results: Segment[];
}

export default function useGetSegments<Type>(
  id?: string | string[] | undefined,
  queryParam?: {
    [key: string]: string;
  },
  condition?: {
    isFetch: boolean;
  },
): {
  data: Type;
  error: any;
  isLoading: boolean;
  mutate: () => Promise<Type>;
} {
  const isFetch = condition?.isFetch === undefined ? true : condition.isFetch;
  const preparedQueryParam = createParam(queryParam);
  const path = id
    ? `/api/v1/dj/segments/${id}/?${preparedQueryParam}`
    : `/api/v1/dj/segments/?${preparedQueryParam}`;

  const { data, error, isLoading, mutate } = useSWR(
    //INFO: slash needs to be added to the end of the path
    isFetch ? path : null,
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
