import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { handleResponseNotOk } from "../utils/error_handler";

export default function useDeleteSegmentAudience<Type>(id?: number | string | string[] | undefined, userId?: number | string | string[]) {
  const url = id && userId ? `/api/v1/dj/segments/${id}/customers/${userId}/` : null;

  const { data, error, isMutating, trigger } = useSWRMutation(
    url,
    async (path) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
      });

      return handleResponseNotOk(res);
    },
  );

  return {
    data: data,
    error,
    isMutating,
    trigger,
  };
}
