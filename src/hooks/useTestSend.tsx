import useSWRMutation from "swr/mutation";
import templateApi from "../api/template";

export default function useTestSend() {
  const { data, error, isMutating, trigger } = useSWRMutation(
    `/api/v1/dj/templates/test_send/`,
    async (_path, { arg }: { arg: { templateId: number; testerIds: number[] } }) => {
      templateApi.testSend(arg.templateId, arg.testerIds);
    },
  );

  return {
    data: data,
    error,
    isMutating,
    trigger,
  };
}
