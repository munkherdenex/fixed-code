import useSWRInfinite from "swr/infinite";
import contactLogApi from "../api/contact_log";

const fetcher = async (url, cursor, source_id = null, status = "active") => {
  return await contactLogApi.getRootChatLogs(cursor, status, source_id);
};

export default function useGetRootChatLogs(source_id = null, status = "active") {
  const getKey = (pageIndex, previousPageData) => {
    // reached the end
    if (previousPageData && !previousPageData.next) return null;
    
    // first page, we don't have previousPageData
    if (pageIndex === 0) return ["/crm/fbchat/chat", null, source_id, status];
    
    // add the cursor to the API endpoint
    const cursor = previousPageData.next;
    return ["/crm/fbchat/chat", cursor, source_id, status];
  };

  const { data, error, size, setSize, isValidating } = useSWRInfinite(
    getKey,
    ([url, cursor, source_id, status]) => fetcher(url, cursor, source_id, status),
    {
      shouldRetryOnError: false,
      revalidateFirstPage: true,
    },
  );

  // Flatten all pages data into one array
  const rootChats = data ? data.flatMap(page => page.results) : [];
  
  // Determine if we have more data to load
  const hasMoreRootChats = data ? data[data.length - 1]?.next !== null : false;
  
  // Function to load more data
  const loadMoreRootChats = () => {
    setSize(size + 1);
  };

  return {
    rootChatLogs: rootChats,
    isLoadingRootChat: !error && !data,
    isErrorRootChat: error,
    hasMoreRootChats,
    loadMoreRootChats,
    isValidatingRootChats: isValidating,
  };
}
