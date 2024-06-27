import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { handleResponseNotOk } from "../utils/error_handler";

export interface FormData {
  name: string;
  description: string;
  type: "manual" | "dynamic" | "static";
  team_id: string;
}

export default function useCreateSegment() {
  const { data, error, isMutating, trigger } = useSWRMutation(
    `/api/v1/dj/segments/`,
    async (path, { arg }: { arg: FormData }) => {
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
