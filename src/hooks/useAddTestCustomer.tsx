import useSWRMutation from "swr/mutation";
import { CustomersType } from "./useGetCustomers";
import audienceApi from "../api/audience";

export default function useAddTestCustomer(customer: CustomersType) {
  const { data, error, isMutating, trigger } = useSWRMutation(
    [`/customers/${customer?.id}`, { id: customer?.id, extended: true }],
    audienceApi.addTestAudience,
    {
      optimisticData: () => ({ ...customer, is_test_user: true })
    },
  );

  return {
    data: data,
    error,
    isMutating,
    addTestCustomerTrigger: trigger,
  };
}
