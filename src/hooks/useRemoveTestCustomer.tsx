import useSWRMutation from "swr/mutation";
import { CustomersType } from "./useGetCustomers";
import audienceApi from "../api/audience";

export default function useRemoveTestCustomer(customer: CustomersType) {
  const { data, error, isMutating, trigger } = useSWRMutation(
    [`/customers/${customer?.id}`, { id: customer?.id, extended: true }],
    audienceApi.removeTestAudience,
    {
      optimisticData: () => ({ ...customer, is_test_user: false })
    },
  );

  return {
    data: data,
    error,
    isMutating,
    removeTestCustomerTrigger: trigger,
  };
}
