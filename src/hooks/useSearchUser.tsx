import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { handleResponseNotOk } from "../utils/error_handler";

export default function useSearchUser<Type>() {
  const url = `/api/v1/user_info`;

  const { data, error, isMutating, trigger } = useSWRMutation(
    url,
    async (path, { arg }: { arg: Type }) => {
      console.log(arg);
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
