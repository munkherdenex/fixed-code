import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { useEffect } from "react";
import { addToast } from "../components/toast";
import { handleResponseNotOk } from "../utils/error_handler";

export default function useDeleteChannel(id?: string | string[] | undefined) {
  const { data, error, isMutating, trigger } = useSWRMutation(
    `/api/v1/dj/channels/${id}/`,
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

  useEffect(() => {
    if (error) {
      addToast({
        id: "delete_fields-error",
        color: "danger",
        title: "An error occurred",
        text: error,
      });
    }
  }, [error]);

  return {
    data: data,
    error,
    isMutating,
    trigger,
  };
}
