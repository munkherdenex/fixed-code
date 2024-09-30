import useSWR from "swr";
import { BASE_URL } from "../constants";
import { handleResponseNotOk } from "../utils/error_handler";
import { createParam } from "../utils/createParam";

export interface CampaignCountSuccessErrorResponse {
  success_count: number;
  error_count: number;
}

export default function useGetCampaignSuccessErrorCount<Type>(
  id: string | string[] | undefined,
  queryParam?: {
    [key: string]: string;
  },
): {
  data: Type;
  error: any;
  isLoading: boolean;
  mutate: () => Promise<Type>;
} {
  const preparedQueryParam = createParam(queryParam);
  const path = id ? `/api/v1/dj/templates/${id}/counts/?${preparedQueryParam}` : null;

  const { data, error, isLoading, mutate } = useSWR(
    //INFO: slash needs to be added to the end of the path
    path,
    async (path) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "GET",
        headers: { "content-type": "application/json" },
        credentials: "include",
      });

      return handleResponseNotOk(res);
    },
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
