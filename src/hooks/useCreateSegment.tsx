import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { handleResponseNotOk } from "../utils/error_handler";

export interface MyFormData {
  name: string;
  description: string;
  type: "manual" | "dynamic" | "static";
  team_id: string;
  input_type: string;
  file: File;
}

export default function useCreateSegment() {
  const { data, error, isMutating, trigger } = useSWRMutation(
    `/api/v1/dj/segments/`,
    async (path, { arg }: { arg: MyFormData }) => {
      const upData = new FormData();
      upData.set("file", arg.file);
      upData.set("type", arg.type);
      upData.set("name", arg.name);
      upData.set("input_type", arg.input_type);
      upData.set("description", arg.description);

      const options = {
        method: "POST",
        body: upData,
        headers: {},
      };
      delete options?.headers["Content-Type"];
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
