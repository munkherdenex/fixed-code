import { useRouter } from "next/router";
import useSWRImmutable from "swr/immutable";
import { BASE_URL } from "../constants";
import { handleResponseNotOk } from "../utils/error_handler";

export default function useProfile() {
  const router = useRouter();

  const { data, error, isLoading } = useSWRImmutable(
    `/api/v1/profile`,
    async (path) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "GET",
        headers: { "content-type": "application/json" },
        credentials: "include",
      });

      return handleResponseNotOk(res, false);
    },
    {
      shouldRetryOnError: router.pathname.includes("/dashboard"),
    },
  );

  return {
    data,
    error,
    isLoading,
  };
}
