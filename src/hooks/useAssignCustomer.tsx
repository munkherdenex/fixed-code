import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { handleResponseNotOk } from "../utils/error_handler";

export interface Customer {
  email: string;
  phone: number;
  rid: string;
  customer_data: { name: string; value: string }[];
}

interface AssignCustomerPayload {
  customer_id: number;
}

export default function useAssignCustomer(contact_log: number) {
  const url = `/api/v1/dj/crm/contact_log/${contact_log}/customer/`;
  const { data, error, isMutating, trigger } = useSWRMutation(
    url,
    async (path, { arg }: { arg: AssignCustomerPayload }) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(arg),
      });

      if (!res.ok) {
        throw new Error("Failed to assign customer to contact log");
      }

      return handleResponseNotOk(res);
    },
  );

  return {
    data,
    error,
    isMutating,
    trigger,
  };
}
