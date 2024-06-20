import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { useEffect } from "react";
import { addToast } from "../components/toast";

export default function useUpdateField<Type>() {
  const { data, error, isMutating, trigger } = useSWRMutation(
    `/api/v1/dj/fields/`,
    async (path, { arg }: { arg: Type }) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(arg),
        credentials: "include",
      });

      if (!res.ok) {
        error.status = res.status;

        throw error;
      }

      return res;
    },
  );

  useEffect(() => {
    if (error) {
      addToast({
        id: "create-fields-error",
        color: "danger",
        title: "An error occurred",
        text: error?.message,
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
