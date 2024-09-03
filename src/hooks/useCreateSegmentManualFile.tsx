import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { handleResponseNotOk } from "../utils/error_handler";

export default function useCreateSegmentManualFile() {
  const { data, error, isMutating, trigger } = useSWRMutation(
    `/api/v1/dj/segments/`,
    async (path, { arg }: { arg: FormData }) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: { "content-type": "multipart/form-data" },
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
