import { useContext } from "react";
import useSWR from "swr";
import { BASE_URL } from "../constants";
import { teamsContext } from "../store/teams_store";
import { createParam } from "../utils/createParam";
import { handleResponseNotOk } from "../utils/error_handler";

export interface MetricType {
  customers_created_api: number;
  customers_created_web: number;
  customers_updated: number;
  notifications_sent_api: number;
  notifications_sent_email: number;
  notifications_sent_inapp: number;
  notifications_sent_push: number;
  notifications_sent_sms: number;
}

export interface MetricResponse {
  "1d": {
    customers_created_api: number;
    customers_created_web: number;
    customers_updated: number;
    notifications_sent_api: number;
    notifications_sent_email: number;
    notifications_sent_inapp: number;
    notifications_sent_push: number;
    notifications_sent_sms: number;
  };
  "7d": {
    customers_created_api: number;
    customers_created_web: number;
    customers_updated: number;
    notifications_sent_api: number;
    notifications_sent_email: number;
    notifications_sent_inapp: number;
    notifications_sent_push: number;
    notifications_sent_sms: number;
  };
  "30d": {
    customers_created_api: number;
    customers_created_web: number;
    customers_updated: number;
    notifications_sent_api: number;
    notifications_sent_email: number;
    notifications_sent_inapp: number;
    notifications_sent_push: number;
    notifications_sent_sms: number;
  };
  "90d": {
    customers_created_api: number;
    customers_created_web: number;
    customers_updated: number;
    notifications_sent_api: number;
    notifications_sent_email: number;
    notifications_sent_inapp: number;
    notifications_sent_push: number;
    notifications_sent_sms: number;
  };
}

/**
 * Get logs data from the server
 * @param queryParam: { limit?: string, offset?: string, template_id?: string, customer_id?: string }
 * @returns data: Type, error: any, isLoading: boolean, mutate: () => Promise<Type>
 */
export default function useGetMetrics<Type>(queryParam?: {
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
  const { currentTeam } = useContext(teamsContext);
  const path = currentTeam ? `/api/v1/dj/analytics/` : null;
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
