import useSWRImmutable from "swr/immutable";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { addToast } from "../components/toast";
import { BASE_URL } from "../constants";
import { Teams } from "../store/teams_store.types";

export default function useTeams(): {
  data: Teams[];
  error: any;
  isLoading: boolean;
} {
  const router = useRouter();
  const { data, error, isLoading } = useSWRImmutable(
    router.pathname.includes("dashboard") ? `/api/v1/teams` : null,
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
        id: "teams-error",
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
