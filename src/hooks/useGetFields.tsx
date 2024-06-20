import useSWR from "swr";
import { BASE_URL } from "../constants";
import { useEffect } from "react";
import { addToast } from "../components/toast";
import { useRouter } from "next/router";

export interface Fields {
  id: number;
  name: string;
  attribute_name: string;
  data_type: "int" | "str" | "datetime" | "bool" | "date";
  team_id: "string" | null;
  created_at: Date;
  updated_at: Date;
  created_by: number | null;
  updated_by: number | null;
}

export default function useGetFields<Type>(id?: string | string[] | undefined): {
  data: Type;
  error: any;
  isLoading: boolean;
} {
  const router = useRouter();
  const path = id ? `/api/v1/dj/fields/${id}/` : `/api/v1/dj/fields/`;
  const { data, error, isLoading } = useSWR(
    //INFO: slash needs to be added to the end of the path
    router.pathname.includes("dashboard") ? path : null,
    async (path) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "GET",
        headers: { "content-type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();

        const error = new Error(data?.error);

        error.status = res.status;

        throw error;
      }

      return res.json();
    },
  );

  useEffect(() => {
    if (error) {
      addToast({
        id: "fields-list-error",
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
