import useSWR from "swr";
import { BASE_URL } from "../constants";
import { handleResponseNotOk } from "../utils/error_handler";
import { createParam } from "../utils/createParam";

export interface Template {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  kind: "email" | "sms" | "push" | "inapp" | "api";
  status: "DRAFT" | "APPROVED" | "PUBLISHED" | "DONE" | "ERROR" | "SENDING";
  description: string;
  body: string;
  created_by: any;
  updated_by: any;
  channel: number;
  aud_count: number;
  start_date?: string | null;
  end_date?: string | null;
  is_recurring?: boolean;
  recur_count?: number | null;
  recur_current_count?: number;
  recur_rule?: {
    FREQ: "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
    BYDAY: [];
    INTERVAL: string;
    BYMONTHDAY: [];
    BYHOUR: string[];
    BYMINUTE: string[];
  } | null;
}

export interface TemplateResponse {
  total_count: number;
  results: Template[];
}

export default function useGetTemplates<Type>(
  id?: string | string[] | undefined,
  queryParam?: {
    [key: string]: string;
  },
  external?: {
    refreshInterval: number;
  },
): {
  data: Type;
  error: any;
  isLoading: boolean;
  mutate: () => Promise<Type>;
} {
  const preparedQueryParam = createParam(queryParam);
  const path = id
    ? `/api/v1/dj/templates/${id}/?${preparedQueryParam}`
    : `/api/v1/dj/templates/?${preparedQueryParam}`;

  const { data, error, isLoading, mutate } = useSWR(
    //INFO: slash needs to be added to the end of the path
    path,
    async (path) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "GET",
        headers: { "content-type": "application/json" },
        credentials: "include",
      });

      return handleResponseNotOk(res);
    },
    {
      refreshInterval: external?.refreshInterval || 0,
    },
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
