import { useEffect } from "react";
import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { addToast } from "../components/toast";

export default function useSignUp<Type>() {
  const { data, error, isMutating, trigger } = useSWRMutation(
    `/api/v1/register`,
    async (path, { arg }: { arg: Type }) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: new Headers({ "content-type": "application/json" }),
        body: JSON.stringify(arg),
      });
      return res;
    },
  );

  useEffect(() => {
    if (error) {
      addToast({
        id: "signUp-error",
        color: "danger",
        title: "An error occurred",
        text: error?.message,
      });
    }
  }, [error]);

  return {
    data: data,
    error,
    isMutating,
    trigger,
  };
}
