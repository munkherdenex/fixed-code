import useSWR from "swr";
import { createParam } from "../utils/createParam";
import audienceApi from "../api/audience";
import { CustomersResponse } from "./useGetCustomers";

export default function useGetTesterCustomers(queryParam?: { [key: string]: string }): {
  data: CustomersResponse;
  error: any;
  isLoading: boolean;
  isValidating: boolean;
  mutate: any;
} {
  const preparedQueryParam = createParam(queryParam);
  const pathKey = `/test_users/?${preparedQueryParam}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    [pathKey, queryParam],
    audienceApi.getTestAudiences,
    {
      revalidateOnFocus: false
    }
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate
  };
}
