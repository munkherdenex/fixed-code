import useSWRMutation from "swr/mutation";
import contactLogApi from "../api/contact_log";

const fetcher = async (url: string, { arg }: { arg: { rootId: string; cursor?: string } }) => {
  const { rootId, cursor } = arg;
  return await contactLogApi.getChatLogs(rootId, cursor);
};

export default function useGetChatLogs() {
  const { data, error, trigger, isMutating } = useSWRMutation("/crm/fbchat/chat", fetcher);

  return {
    chatLogs: data,
    isLoading: isMutating,
    isError: error,
    getChatLogsTrigger: trigger,
  };
}
