import useSWR from "swr";
import { BASE_URL } from "../constants";
import { handleResponseNotOk } from "../utils/error_handler";
import { createParam } from "../utils/createParam";

export interface Template {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  kind: "email" | "sms" | "push" | "inapp";
  status: "DRAFT" | "APPROVED" | "PUBLISHED" | "DONE";
  body: string;
  created_by: any;
  updated_by: any;
  ch_id: number;
}

export interface TemplateResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Template[];
}

export default function useGetTemplates<Type>(
  id?: string | string[] | undefined,
  queryParam?: {
    [key: string]: string;
  },
): {
  data: Type;
  error: any;
  isLoading: boolean;
  mutate: () => Promise<Type>;
} {
  const path = id ? `/api/v1/dj/templates/${id}/` : `/api/v1/dj/templates/`;
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
