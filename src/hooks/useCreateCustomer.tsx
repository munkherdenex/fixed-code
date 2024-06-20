import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { useEffect } from "react";
import { addToast } from "../components/toast";

export interface Customer {
  email: string;
  phone: number;
  rid: string;
  customer_data: { name: string; value: string }[];
}

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
      console.log(error.error_message);
      addToast({
        id: "create_customer-error",
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
