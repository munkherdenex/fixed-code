import useSWRMutation from "swr/mutation";
import { BASE_URL } from "../constants";
import { createParam } from "../utils/createParam";
import { handleResponseNotOk } from "../utils/error_handler";

export default function useGetCustomerAnalytics<Type>(queryParam?: { [key: string]: string }) {
  const preparedQueryParam = createParam(queryParam);
  const path = `/api/v1/dj/analytics-v2/?${preparedQueryParam}`;
  // const path = `/api/v1/dj/analytics-v2/template/?${preparedQueryParam}`;
  // const path = `/api/v1/dj/analytics-v2/template/last?${preparedQueryParam}`;

  const { data, error, trigger, isMutating } = useSWRMutation(
    path,
    async (path, { arg }: { arg: Type }) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(arg),
      });

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
