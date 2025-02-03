import useSWRMutation from "swr/mutation";
import contactLogApi from "../api/contact_log";

const fetcher = async (url: string, { arg }: { arg: { rootId: string; cursor?: string } }) => {
  const { rootId, cursor } = arg;
  return await contactLogApi.getChatLogs(rootId, cursor);
};

// Define the hook
export default function useGetChatLogs() {
  const { data, error, trigger, isMutating } = useSWRMutation("/crm/fbchat/chat", fetcher);

  return {
    chatLogs: data,
    isLoading: isMutating,
    isError: error,
    getChatLogsTrigger: trigger,
  };
}

// import useSWRInfinite from "swr/infinite"; // Use SWR's infinite loading hook
// import axios from "axios";

// const fetcher = async (url: string) => {
//   const response = await axios.get(url);
//   return response.data;
// };

// // Define the hook
// export default function useGetChatLogs(rootId: string) {
//   const { data, error, size, setSize, isValidating } = useSWRInfinite(
//     (pageIndex, previousPageData) => {
//       // If there's no more data, stop fetching
//       if (previousPageData && !previousPageData.nextCursor) return null;

//       // First page, no cursor
//       if (pageIndex === 0) return `/crm/fbchat/chat/${rootId}/`;

//       // Subsequent pages, use the cursor from the previous page
//       return `/crm/fbchat/chat/${rootId}/?cursor=${previousPageData.nextCursor}`;
//     },
//     fetcher,
//   );

//   // Flatten the data array
//   const chatLogs = data ? data.flatMap((page) => page.logs) : [];

//   // Check if there's more data to load
//   const isLoadingMore = !error && size > 0 && data && typeof data[size - 1] === "undefined";
//   const isReachingEnd = data && data[data.length - 1]?.nextCursor === null;

//   return {
//     chatLogs,
//     isLoading: !data && !error,
//     isError: error,
//     isLoadingMore,
//     isReachingEnd,
//     loadMore: () => setSize(size + 1), // Function to load more data
//   };
// }
