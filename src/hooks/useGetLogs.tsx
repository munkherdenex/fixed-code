import useSWR from "swr";
import { BASE_URL } from "../constants";
import { handleResponseNotOk } from "../utils/error_handler";
import { createParam } from "../utils/createParam";

export interface Logs {
  created_at: string;
  updated_at: string;
  template_id: number;
  customer_id: number;
  title: string;
  body: string;
  response: string;
  response_status: string;
}

export interface LogsResponse {
  total_count: number;
  results: Logs[];
}

/**
 * Get logs data from the server
 * @param queryParam: { limit?: string, offset?: string, template_id?: string, customer_id?: string }
 * @returns data: Type, error: any, isLoading: boolean, mutate: () => Promise<Type>
 */
export default function useGetLogs<Type>(queryParam?: {
  limit?: string;
  offset?: string;
  template_id?: string;
  customer_id?: string;
}): {
  data: Type;
  error: any;
  isLoading: boolean;
  mutate: () => Promise<Type>;
} {
  const path = `/api/v1/dj/logs/`;
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
