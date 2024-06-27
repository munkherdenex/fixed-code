import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { handleResponseNotOk } from "../utils/error_handler";

export default function useInviteMember<Type>(team_id: number | string | null) {
  const url = team_id ? `/api/v1/teams/${team_id}/members/` : null;

  const { data, error, isMutating, trigger } = useSWRMutation(
    url,
    async (path, { arg }: { arg: Type }) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(arg),
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
