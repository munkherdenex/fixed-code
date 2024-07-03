import useSWR from "swr";
import { BASE_URL } from "../constants";
import { useRouter } from "next/router";
import { handleResponseNotOk } from "../utils/error_handler";

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

export interface FieldsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Fields[];
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

      return handleResponseNotOk(res);
    },
  );

  return {
    data,
    error,
    isLoading,
  };
}
