import * as yup from "yup";
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
  count: number;
  next: string | null;
  previous: string | null;
  results: CustomersType[];
}

export default function useGetCustomers<Type>(
  id?: string | string[] | undefined,
  searchValue?: {
    email?: string;
    phone?: string;
  },
  limit?: number,
): {
  data: Type;
  error: any;
  isLoading: boolean;
  mutate: any;
} {
  const path = id ? `/api/v1/dj/customers/${id}/?extended=true` : "/api/v1/dj/customers/";

  const queryParam = createParam({
    ...searchValue,
    limit,
  });

  const { data, error, isLoading, mutate } = useSWR(`${path}?${queryParam}`, async (path) => {
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
