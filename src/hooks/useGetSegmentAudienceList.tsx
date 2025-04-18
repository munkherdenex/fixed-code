import useSWR from "swr";
import { BASE_URL } from "../constants";
import { useRouter } from "next/router";
import { handleResponseNotOk } from "../utils/error_handler";
import { createParam } from "../utils/createParam";

export interface SegmentAudience {
  id: number;
  created_at: string;
  updated_at: string;
  rid: string;
  phone: string;
  email: string;
  created_by: number;
  updated_by: number;
  source: string;
  team_id: string;
}

export interface SegmentAudienceResponse {
  total_count: number;
  total_pages: number;
  current_page: number;
  results: SegmentAudience[];
}

export default function useGetSegmentAudienceList<Type>(
  id?: string | string[] | undefined,
  queryParam?: {
    [key: string]: string;
  },
): {
  data: Type;
  error: any;
  isLoading: boolean;
  mutate: any;
} {
  const router = useRouter();
  const preparedQueryParam = createParam(queryParam);
  const path = id ? `/api/v1/dj/segments/${id}/customers/?${preparedQueryParam}` : null;

  const { data, error, isLoading, mutate } = useSWR(
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
    mutate,
  };
}
