import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { useEffect } from "react";
import { addToast } from "../components/toast";

export default function useLogout<Type>() {
  const { data, error, isMutating, trigger } = useSWRMutation(
    `/api/v1/logout`,
    async (path, { arg }: { arg: Type }) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(arg),
        credentials: "include",
      });
      return res;
    },
  );

  return {
    data: data,
    error,
    isMutating,
    trigger,
  };
}
