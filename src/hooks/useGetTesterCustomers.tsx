import useSWR from "swr";
import { createParam } from "../utils/createParam";
import audienceApi from "../api/audience";
import { CustomerDataType, CustomersType } from "./useGetCustomers";

export default function useGetTesterCustomers<Type>(queryParam?: { [key: string]: string }): {
  data: Type;
  error: any;
  isLoading: boolean;
  mutate: any;
  removeAudience: CallableFunction;
} {
  const preparedQueryParam = createParam(queryParam);
  const pathKey = `/test_users/?${preparedQueryParam}`;

  const { data, error, isLoading, mutate } = useSWR(
    [pathKey, queryParam],
    audienceApi.getTestAudiences,
  );

  const removeAudience = async (customer: CustomersType) => {
    try {
      await audienceApi.removeTestAudience(customer?.id);
      mutate(
        (prevData) => {
          if (!prevData) return prevData;
          return prevData?.results?.filter((cc) => cc.id !== customer.id);
        },
        false,
      );
      mutate();
    } catch (error) {
      mutate();
    }
  };

  return {
    data,
    error,
    isLoading,
    mutate,
    removeAudience,
  };
}
