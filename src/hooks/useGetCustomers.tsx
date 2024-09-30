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
  phone: string;
  email: string;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
  source: string;
  team_id: string;
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
): {
  data: Type;
  error: any;
  isLoading: boolean;
  mutate: any;
} {
  const preparedQueryParam = createParam(queryParam);
  const path = id
    ? `/api/v1/dj/customers/${id}/?${preparedQueryParam}`
    : `/api/v1/dj/customers/?${preparedQueryParam}`;

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
