import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { handleResponseNotOk } from "../utils/error_handler";

export default function useCreateTemplateAudience<Type>(id: string | string[] | undefined) {
  const path = id ? `/api/v1/dj/templates/${id}/customers/` : null;
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
