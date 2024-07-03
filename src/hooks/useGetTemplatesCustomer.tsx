import useSWR from "swr";
import { BASE_URL } from "../constants";
import { useRouter } from "next/router";
import { handleResponseNotOk } from "../utils/error_handler";

export interface TemplateCustomer {
  name: string;
  type: "customer" | "segment";
  object_id: number;
}

export default function useGetTemplatesCustomer<Type>(id: string | string[] | undefined): {
  data: Type;
  error: any;
  isLoading: boolean;
} {
  const router = useRouter();
  const path = `/api/v1/dj/templates/${id}/customers/`;
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
    data: data || [],
    error,
    isLoading,
  };
}
