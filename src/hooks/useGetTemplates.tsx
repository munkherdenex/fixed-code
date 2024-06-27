import useSWR from "swr";
import { BASE_URL } from "../constants";
import { useEffect } from "react";
import { addToast } from "../components/toast";
import { useRouter } from "next/router";
import { handleResponseNotOk } from "../utils/error_handler";

export interface Template {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  kind: "email" | "sms" | "push" | "inapp";
  body: string;
  created_by: any;
  updated_by: any;
  ch_id: number;
}

export default function useGetTemplates<Type>(id?: string | string[] | undefined): {
  data: Type;
  error: any;
  isLoading: boolean;
} {
  const router = useRouter();
  const path = id ? `/api/v1/dj/templates/${id}/` : `/api/v1/dj/templates/`;
  const { data, error, isLoading } = useSWR(
    //INFO: slash needs to be added to the end of the path
    router.pathname.includes("dashboard") ? path : null,
    async (path) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "GET",
        headers: { "content-type": "application/json" },
        credentials: "include",
      });

      return handleResponseNotOk(res);
    },
  );

  useEffect(() => {
    if (error) {
      addToast({
        id: "templates-list-error",
        color: "danger",
        title: "An error occurred",
        text: error?.message,
      });
    }
  }, [error]);

  return {
    data,
    error,
    isLoading,
  };
}
