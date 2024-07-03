import useSWR from "swr";
import { BASE_URL } from "../constants";
import { useRouter } from "next/router";
import { handleResponseNotOk } from "../utils/error_handler";

export interface SegmentCustomer {
  id: number;
  created_at: string;
  updated_at: string;
  rid: string;
  phone: string;
  email: string;
  created_by: number;
  updated_by: number;
  source: string;
  team_id: string;
}

export interface SegmentCustomerResponse {
  count: number;
  next: string;
  previous: string;
  results: SegmentCustomer[];
}

export default function useGetSegmentCustomerList<Type>(id?: string | string[] | undefined): {
  data: Type;
  error: any;
  isLoading: boolean;
} {
  const router = useRouter();
  const path = id ? `/api/v1/dj/segments/${id}/customers/?extended=true` : null;
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
