import useSWRImmutable from "swr/immutable";
import { BASE_URL } from "../constants";
import { handleResponseNotOk } from "../utils/error_handler";

export default function useProfile() {
  const { data, error, isLoading } = useSWRImmutable(`/api/v1/profile`, async (path) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: { "content-type": "application/json" },
      credentials: "include",
    });

    return handleResponseNotOk(res, false);
  });

  return {
    data,
    error,
    isLoading,
  };
}
