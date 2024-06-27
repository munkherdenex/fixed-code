import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { handleResponseNotOk } from "../utils/error_handler";

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
