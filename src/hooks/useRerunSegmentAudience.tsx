import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { handleResponseNotOk } from "../utils/error_handler";

export default function useRerunSegmentAudience(id: string | string[]) {
  const path = `/api/v1/dj/segments/${id}/reload/`;

  const { data, error, isMutating, trigger } = useSWRMutation(path, async (path) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
    });

    return handleResponseNotOk(res);
  });

  return {
    data: data,
    error,
    isMutating,
    trigger,
  };
}
