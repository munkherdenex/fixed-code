import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { useEffect } from "react";
import { addToast } from "../components/toast";

export default function useDeleteCustomer<Type>(id?: string | string[] | undefined) {
  const { data, error, isMutating, trigger } = useSWRMutation(
    `/api/v1/dj/customers/${id}/`,
    async (path) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
      });
      if (!res.ok) {
        const data = await res.json();
        const error = new Error(data?.error);
        error.status = res.status;
        throw error;
      }
      return res;
    },
  );

  useEffect(() => {
    if (error) {
      addToast({
        id: "delete_customer-error",
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
    customerDeleteTrigger: trigger,
  };
}
