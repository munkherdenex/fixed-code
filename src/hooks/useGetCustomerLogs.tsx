import useSWR from "swr";
import { BASE_URL } from "../constants";
import { handleResponseNotOk } from "../utils/error_handler";
import { createParam } from "../utils/createParam";

export interface CustomerLogs {
  id: number;
  type?: "create" | "update" | "event";
  status?: "visible" | "hidden";
  title: string;
  data?: {};
  created_at: string;
}

export interface CustomerLogsResponse {
  total_count: number;
  results: CustomerLogs[];
}

/**
 * Fetches the customer logs from the api
 * @param id - the id of the customer
 * @param queryParam - the query parameters
 * @returns the data, error, isLoading and mutate function
 */
export default function useGetCustomerLogs<Type>(
  id?: string | string[] | undefined,
  queryParam?: {
    limit?: string;
    offset?: string;
  },
): {
  data: Type;
  error: any;
  isLoading: boolean;
  mutate: () => Promise<Type>;
} {
  const path = id ? `/api/v1/dj//customers/${id}/logs/` : undefined;
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
    {
      refreshInterval: 3000,
    },
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
