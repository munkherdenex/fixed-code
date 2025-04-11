import useSWR from "swr";
import ticketTemplateApi from '@/api/ticket_template';

export interface CRMTicketTemplate {
  id: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  team_id?: number;
  is_active: boolean;
  has_priority: boolean;
  is_system_template?: boolean;
  fields: [
    {
      id: 0;
      name: "string";
      type: "string";
      config: {};
    },
  ] | [];
}

export interface CRMTicketTemplateResponse {
  total_count: number;
  results: CRMTicketTemplate[];
}

export default function useGetCRMTicketTemplate<Type>(
  id?: string | string[] | undefined,
  queryParam?: { [key: string]: string },
): {
  data: Type;
  error: any;
  isLoading: boolean;
  mutate: () => Promise<Type>;
} {
  const path = id
    ? `/api/v1/dj/crm/ticket/template/${id}`
    : `/api/v1/dj/crm/ticket/template/`;

  const queryKey = JSON.stringify(queryParam || {});

  const { data, error, isLoading, mutate } = useSWR(
    //INFO: slash needs to be added to the end of the path
    [path, queryKey],
    async (_path) => {
      return ticketTemplateApi.getList(queryParam);
    },
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
