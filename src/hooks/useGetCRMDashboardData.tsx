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
  template_id?: string;
  customer_id?: string;
  kind?: string;
  status?: string;
  log_types?: [string];
  group_by_kind?: boolean;
  measurement?: measurementType;
  yield_name?: yieldNameType;
}

export default function useGetCRMDashboardData(queryParams) {
  const preparedQueryParam = createParam({ ...queryParams });
  const path = `/api/v1/dj/crm/summary/tickets/`;

  const { data, error, isLoading, mutate } = useSWR(path, async (path) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: { "content-type": "application/json" },
      credentials: "include",
    });

    return handleResponseNotOk(res);
  });

  return {
    dashBoardData: data,
    dashBoardDataError: error,
    isDashBoardDataLoading: isLoading,
    refreshDashBoardData: mutate,
  };
}
