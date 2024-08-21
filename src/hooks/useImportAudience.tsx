import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { handleResponseNotOk } from "../utils/error_handler";

export default function useImportAudience<Type>() {
  const { data, error, isMutating, trigger } = useSWRMutation(
    `/api/v1/dj/customers/`,
    async (path, { arg }: { arg: any }) => {
      const upData = new FormData()
      upData.set("file", arg.file[0])

      console.log(arg.file, upData.get('file'))

      const options = {
        method: "POST",
        body: upData,
        headers: {}
      }

      delete options?.headers['Content-Type'];


      const res = await fetch(`${BASE_URL}${path}`, options);

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
