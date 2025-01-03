import useSWR from "swr";
import { BASE_URL } from "../constants";
import { createParam } from "../utils/createParam";
import { handleResponseNotOk } from "../utils/error_handler";

export default function useGetTesterCustomers<Type>(
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
  mutate: any;
} {
  const isFetch = condition?.isFetch === undefined ? true : condition.isFetch;
  const preparedQueryParam = createParam(queryParam);
  const path = id
    ? `/api/v1/dj/test_users/${id}/?${preparedQueryParam}`
    : `/api/v1/dj/test_users/?${preparedQueryParam}`;

  const { data, error, isLoading, mutate } = useSWR(isFetch ? path : null, async (path) => {
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
    mutate,
  };
}
