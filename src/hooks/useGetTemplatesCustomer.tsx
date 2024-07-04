import useSWR from "swr";
import { BASE_URL } from "../constants";
import { handleResponseNotOk } from "../utils/error_handler";
import { createParam } from "../utils/createParam";

export interface TemplateCustomer {
  name: string;
  type: "customer" | "segment";
  object_id: number;
}

export interface TemplateCustomerResponse {
  results: TemplateCustomer[];
  count: number;
  next: string | null;
  previous: string | null;
}

export default function useGetTemplatesCustomer<Type>(
  id: string | string[] | undefined,
  queryParam: {
    [key: string]: string;
  },
): {
  data: Type;
  error: any;
  isLoading: boolean;
} {
  const path = id ? `/api/v1/dj/templates/${id}/customers/` : null;
  const preparedQueryParam = createParam(queryParam);

  const { data, error, isLoading } = useSWR(
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
    data: data || [],
    error,
    isLoading,
  };
}
