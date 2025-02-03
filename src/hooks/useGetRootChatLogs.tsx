import useSWR from "swr";
import contactLogApi from "../api/contact_log";

const fetcher = async (limit: number, offset: number) => {
  return await contactLogApi.getRootChatLogs(limit, offset);
};

export default function useGetRootChatLogs(limit: number, offset: number) {
  const { data, error } = useSWR(
    ["/crm/fbchat/chat", limit, offset],
    ([url, limit, offset]) => fetcher(limit, offset),
    {
      shouldRetryOnError: false,
    },
  );

  return {
    rootChatLogs: data,
    isLoadingRootChat: !error && !data,
    isErrorRootChat: error,
  };
}
