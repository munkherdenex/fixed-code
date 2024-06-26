import useSWR from "swr";
import { BASE_URL } from "../constants";
import { useEffect } from "react";
import { addToast } from "../components/toast";
import { useRouter } from "next/router";
import { handleResponseNotOk } from "../utils/error_handler";

export interface Segment {
  created_at: string;
  created_by: number;
  description: string | null;
  id: number;
  name: string;
  team_id: string | null;
  type: string;
  updated_at: string;
  updated_by: number | null;
}

export default function useGetSegments<Type>(id?: string | string[] | undefined): {
  data: Type;
  error: any;
  isLoading: boolean;
} {
  const router = useRouter();
  const path = id ? `/api/v1/dj/segments/${id}/` : `/api/v1/dj/segments/`;
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
        id: "segments-list-error",
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
