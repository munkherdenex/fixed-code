import { BASE_URL } from "../constants";
import { createParam } from "../utils/createParam";
import { handleResponseNotOk } from "../utils/error_handler";
import useSWR from "swr";

export default function useGetCampaignAnalyticsTable<Type>(queryParam?: { [key: string]: string }) {
  const preparedQueryParam = createParam(queryParam);
  const path = `/api/v1/dj/analytics-v2/template/last?${preparedQueryParam}`;

  const { data, error, isLoading, mutate } = useSWR(path, async (path) => {
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
