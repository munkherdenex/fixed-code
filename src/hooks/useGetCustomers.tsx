import useSWR from "swr";
import { BASE_URL } from "../constants";
import { CustomersType } from "../constants/customer.types";
import { handleResponseNotOk } from "../utils/error_handler";

export default function useGetCustomers(id?: string | string[] | undefined) {
  const url = id ? `/api/v1/dj/customers/${id}/?extended=true` : "/api/v1/dj/customers/";
  const { data, error, isLoading, mutate } = useSWR(url, async (path) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: { "content-type": "application/json" },
      credentials: "include",
    });

    return handleResponseNotOk(res);
  });

  return {
    data: (data as unknown as CustomersType[]) || [],
    detailData: data as CustomersType,
    error,
    isLoading,
    mutate,
  };
}
