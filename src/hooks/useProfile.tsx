import useSWRImmutable from "swr/immutable";
import { BASE_URL } from "../constants";
import { useRouter } from "next/router";
import { handleResponseNotOk } from "../utils/error_handler";

export default function useProfile() {
  const router = useRouter();
  const { data, error, isLoading } = useSWRImmutable(
    router.pathname.includes("dashboard") ? `/api/v1/profile` : null,
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
