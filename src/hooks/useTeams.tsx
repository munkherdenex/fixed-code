import useSWRImmutable from "swr/immutable";
import { useRouter } from "next/router";
import { BASE_URL } from "../constants";
import { Teams } from "../store/teams_store.types";
import { handleResponseNotOk } from "../utils/error_handler";
import { createParam } from "../utils/createParam";

export default function useTeams(queryParam?: { [key: string]: string }): {
  data: Teams[];
  error: any;
  isLoading: boolean;
} {
  const router = useRouter();
  const preparedQueryParam = createParam(queryParam);

  const path = router.pathname.includes("dashboard") ? `/api/v1/teams?${preparedQueryParam}` : null;

  const { data, error, isLoading } = useSWRImmutable(path, async (path) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: { "content-type": "application/json" },
      credentials: "include",
    });

    return handleResponseNotOk(res);
  });

  return {
    data,
    error,
    isLoading,
  };
}
