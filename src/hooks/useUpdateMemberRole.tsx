import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { useContext, useEffect } from "react";
import { addToast } from "../components/toast";
import { handleResponseNotOk } from "../utils/error_handler";
import { teamsContext } from "../store/teams_store";

export default function useUpdateMemberRole<Type>(id: string | string[] | undefined) {
  const { currentTeam } = useContext(teamsContext);
  const url = currentTeam?.id && id ? `/api/v1/teams/${currentTeam?.id}/members/${id}` : null;

  const { data, error, isMutating, trigger } = useSWRMutation(
    url,
    async (path, { arg }: { arg: Type }) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(arg),
      });

      return handleResponseNotOk(res);
    },
  );

  useEffect(() => {
    if (error) {
      addToast({
        id: "update_member-error",
        color: "danger",
        title: "An error occurred",
        text: error,
      });
    }
  }, [error]);

  return {
    data: data,
    error,
    isMutating,
    trigger
  };
}
