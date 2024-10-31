import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { handleResponseNotOk } from "../utils/error_handler";
import { useManagementTeamsContext } from "../store/management_teams_store";

export default function useDeleteMember<Type>(id?: string | string[] | undefined) {
  const { currentTeam } = useManagementTeamsContext();
  const url = currentTeam?.id ? `/api/v1/teams/${currentTeam?.id}/members/${id}` : null;

  const { data, error, isMutating, trigger } = useSWRMutation(
    url,
    async (path, { arg }: { arg: Type }) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "DELETE",
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
