import useSWRImmutable from "swr/immutable";
import { useRouter } from "next/router";
import { BASE_URL } from "../constants";
import { handleResponseNotOk } from "../utils/error_handler";
import { createParam } from "../utils/createParam";

export default function useTeams<Type>(
  id?: string,
  queryParam?: { [key: string]: string },
): {
  data: Type;
  error: any;
  isLoading: boolean;
} {
  const router = useRouter();
  const preparedQueryParam = createParam(queryParam);

  const path = router.pathname.includes("dashboard") ? `/api/v1/teams?${preparedQueryParam}` : null;
  const idPath = id ? `/api/v1/teams/${id}?${preparedQueryParam}` : path;

  const { data, error, isLoading } = useSWRImmutable(idPath, async (path) => {
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
