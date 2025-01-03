import { BASE_URL } from "../constants";
import { handleResponseNotOk } from "../utils/error_handler";
import { createParam } from "../utils/createParam";
import useSWRImmutable from "swr/immutable";

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
  total_count: number;
  results: Fields[];
}

export default function useGetFields<Type>(
  id?: string | string[] | undefined,
  queryParam?: {
    [key: string]: string;
  },
): {
  data: Type;
  error: any;
  isLoading: boolean;
} {
  const preparedQueryParam = createParam(queryParam);
  const path = id
    ? `/api/v1/dj/fields/${id}/?${preparedQueryParam}`
    : `/api/v1/dj/fields/?${preparedQueryParam}`;

  const { data, error, isLoading } = useSWRImmutable(
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
  );

  return {
    data,
    error,
    isLoading,
  };
}
