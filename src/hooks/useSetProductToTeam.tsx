import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { handleResponseNotOk } from "../utils/error_handler";

export interface SetProduct {
  team_ids: number[];
}

/**
 * @param productId - team id
 * @returns {data, error, isMutating, trigger}
 */
export default function useSetProductToTeam<Type, ResponseType>(
  productId: string | number | undefined,
  teamId: string | number | undefined,
): {
  data: Type | undefined;
  error: Error | null;
  isMutating: boolean;
  trigger: (arg: Type) => Promise<ResponseType>;
} {
  const path = productId ? `/api/v1/products/${productId}/team/${teamId}` : null;

  const { data, error, isMutating, trigger } = useSWRMutation(
    path,
    async (path, { arg }: { arg: Type }) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(arg),
        credentials: "include",
      });

      return handleResponseNotOk(res);
    },
  );

  return {
    data: data,
    error,
    isMutating,
    trigger,
  };
}
