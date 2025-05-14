import useSWR from "swr";
import { BASE_URL } from "../constants";
import { handleResponseNotOk } from "../utils/error_handler";
import { createParam } from "../utils/createParam";

/**
 * Interface for user information found in created_by and updated_by fields.
 */
export interface UserProfile {
  id: number;
  email: string;
}

/**
 * Interface for the structure of an individual field within the 'fields' array.
 */
export interface TicketField {
  id: number;
  created_by: UserProfile;
  updated_by: UserProfile;
  attr_name: string;
  // 'value' is defined as {} in the JSON, implying it can be any structure.
  // You might want to make this more specific if you know the possible shapes.
  value: any;
  type: string;
  // 'config' is defined as {} in the JSON, implying it can be any structure.
  // You might want to make this more specific if you know the possible shapes.
  config: any;
  created_at: string; // Using string as it's an ISO 8601 date string
  updated_at: string; // Using string as it's an ISO 8601 date string
  field_template: number;
  ticket: number;
}

/**
 * Interface for the structure of the 'priority' object.
 */
export interface PriorityValue {
  id: number;
  name: string;
  duration: string; // Assuming duration is a string representation (e.g., "2 hours")
}

/**
 * Interface for the main data structure representing the ticket or similar entity.
 */
export interface CustomerTickets {
  id?: number;
  created_by?: UserProfile;
  updated_by?: UserProfile;
  fields: TicketField[];
  // 'tags' is a string in the example, but often tags are an array of strings.
  // Based *strictly* on the example, it's a string. If it can be an array, change this to string[] | string.
  tags?: string[];
  priority?: PriorityValue;
  source?: string;
  title?: string | null;
  body?: string | null;
  created_team_id?: number;
  // 'category' is an enum-like string in the example. You might define a union type if possible categories are known.
  category?: "reference" | "feedback" | "complaint" | "error" | "collaborate" | null;
  needs_callback?: boolean;
  created_at?: string; // Using string as it's an ISO 8601 date string
  updated_at?: string; // Using string as it's an ISO 8601 date string
  assigned_team_id?: number | null;
  // 'status' is an enum-like string in the example. You might define a union type if possible statuses are known.
  status?: string;
  customer?: number | null;
  ticket_template?: number | null;
  contact_log?: number | null;
  assigned_to?: number | null;
}

export interface CustomerTicketsResponse {
  total_count: number;
  total_pages: number;
  current_page: number;
  results: CustomerTickets[];
}

/**
 * Fetches the customer logs from the api
 * @param id - the id of the customer
 * @param queryParam - the query parameters
 * @returns the data, error, isLoading and mutate function
 */
export default function useGetCustomerTickets<Type>(
  id?: string | string[] | undefined,
  queryParam?: {
    pageIndex?: string;
    pageSize?: string;
  },
): {
  data: Type;
  error: any;
  isLoading: boolean;
  mutate: () => Promise<Type>;
} {
  const preparedQueryParam = createParam(queryParam);
  const path = id ? `/api/v1/dj/crm/customer/${id}/tickets/?${preparedQueryParam}` : null;

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
