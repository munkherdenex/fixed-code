import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { useEffect } from "react";
import { addToast } from "../components/toast";

export default function useCreateCustomer<Type>() {
  const { data, error, isMutating, trigger } = useSWRMutation(
    `/api/v1/dj/customers/`,
    async (path, { arg }: { arg: Type }) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(arg),
      });

      if (!res.ok) {
        const data = await res.json();
        const error = new Error(data?.error);
        error.status = res.status;
        error.error_message = data;
        throw error;
      }
      return res.json();
    },
  );

  useEffect(() => {
    if (error) {
      console.log(error.error_message)
      addToast({
        id: "create_customer-error",
        color: "danger",
        title: String(Object.keys(error?.error_message)) || "An error occurred",
        text: String(Object.values(error?.error_message)) || error,
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
