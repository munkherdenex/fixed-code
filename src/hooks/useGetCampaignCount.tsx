import useSWR from "swr";
import { BASE_URL } from "../constants";
import { handleResponseNotOk } from "../utils/error_handler";
import { createParam } from "../utils/createParam";
import templateApi from '../api/template';

export interface CampaignCountSuccessErrorResponse {
  success_count: number;
  error_count: number;
  opened_count: number;
  clicked_count: number;
  total_sent_count: number;
}

export default function useGetCampaignSuccessErrorCount(
  id: string | string[] | undefined,
  queryParam?: {
    [key: string]: string;
  },
): {
  data: CampaignCountSuccessErrorResponse;
  error: any;
  isLoading: boolean;
  mutate: () => Promise<CampaignCountSuccessErrorResponse>;
} {
  const preparedQueryParam = createParam(queryParam);
  const path = id ? `/api/v1/dj/templates/${id}/counts/?${preparedQueryParam}` : null;

  const { data, error, isLoading, mutate } = useSWR(
    //INFO: slash needs to be added to the end of the path
    path,
    (_path) => {
      return templateApi.getStatCounts(+id)
    },
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
