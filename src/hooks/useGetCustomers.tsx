import useSWR from "swr";
import { BASE_URL } from "../constants";
import { createParam } from "../utils/createParam";
import { handleResponseNotOk } from "../utils/error_handler";

export interface CustomerDataType {
  [key: string]: string;
}

export interface CustomersType {
  id: number;
  customer_data: CustomerDataType;
  currency: string;
  rid: string;
  name: string;
  last_name: string;
  phone: string;
  email: string;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
  source: string;
  team_id: string;
  is_subscribed: boolean;
  last_clicked_at: string;
  last_opened_at: string;
  open_rate: string;
  status: string;
  click_rate: string;
  total_clicks: string;
  total_sent: string;
  total_unique_opens: string;
  unsubscribed_at: string;
  is_test_user: boolean;
}

export interface CustomersResponse {
  total_count: number;
  results: CustomersType[];
}

export default function useGetCustomers<Type>(
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
    ? `/api/v1/dj/customers/${id}/?${preparedQueryParam}`
    : `/api/v1/dj/customers/?${preparedQueryParam}`;

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
