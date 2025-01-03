import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { handleResponseNotOk } from "../utils/error_handler";
import { CustomersType } from './useGetCustomers';

export default function useRemoveTestCustomer(customer: CustomersType) {
  const { data, error, isMutating, trigger } = useSWRMutation(
    `/api/v1/dj/test_users/${customer?.id}/`,
    async (path) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
      });

      return handleResponseNotOk(res);
    },{
      optimisticData: () => {
        console.log('optimisticData', customer)
        return { ...customer, is_test_user: false }
      },
    }
  );

  return {
    data: data,
    error,
    isMutating,
    removeTestCustomerTrigger: trigger,
  };
}
