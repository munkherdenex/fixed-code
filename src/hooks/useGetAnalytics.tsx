import useSWR from "swr";
import { BASE_URL } from "../constants";
import { createParam } from "../utils/createParam";
import { handleResponseNotOk } from "../utils/error_handler";

type intervalType = "1d" | "7d" | "1m" | "1y";
type measurementType = "1" | "2" | "3" | "4";
type yieldNameType = "count" | "sum" | "mean" | "min" | "max" | "median";

export interface AnalyticsData {
  interval: intervalType;
  start?: string;
  end?: string;
  template_id?: string;
  customer_id?: string;
  kind?: string;
  status?: string;
  log_types?: [string];
  group_by_kind?: boolean;
  measurement?: measurementType;
  yield_name?: yieldNameType;
}

export default function useGetAnalytics(
  timePeriod: string | null,
  queryParams?: { [key: string]: string },
  customerId?: string
) {
  const preparedQueryParam = createParam(
    timePeriod ? { interval: timePeriod, ...queryParams } : { ...queryParams }
  );

  const path = `/api/v1/dj/analytics-v2/?${preparedQueryParam}${customerId ? `&customer_id=${customerId}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR(path, async (path) => {
    console.log("Fetching Analytics:", `${BASE_URL}${path}`); 
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: { "content-type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Analytics API Error:", res.status, errorBody);
    }

    return handleResponseNotOk(res);
  });

  return {
    analyticsData: data,
    analyticsError: error,
    isAnalyticsLoading: isLoading,
    refreshAnalytics: mutate,
  };
}

