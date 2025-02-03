import { useState } from "react";
import useSWRInfinite from "swr/infinite";
import axios from "axios";

interface ChatMessage {
  id: number;
  customer_id: number | null;
  type: string;
  body: string;
  source: string;
  email: string | null;
  phone: string | null;
  team_id: number | null;
  chat_is_root: boolean;
  chat_id: string;
  chat_state: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  chat_parent: number;
  chat_from: number;
  chat_to: number | null;
  created_by: number | null;
  updated_by: number | null;
}

interface ChatMessagesResponse {
  next: string | null;
  previous: string | null;
  results: ChatMessage[];
}

interface ChatLogsInfiniteScrollProps {
  rootId: string;
  initialData: ChatMessagesResponse;
}

const fetcher = (url: string, cursor: string | null) =>
  axios.get<ChatMessagesResponse>(url, { params: { cursor } }).then((res) => res.data);

const ChatLogsInfiniteScroll: React.FC<ChatLogsInfiniteScrollProps> = ({ rootId, initialData }) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const getKey = (pageIndex: number, previousPageData: ChatMessagesResponse | null) => {
    if (rootId) {
      if (previousPageData && !previousPageData.next) {
        return null;
      }
      if (pageIndex === 0) {
        return [`/crm/fbchat/chat/${rootId}/`];
      }
      return [`/crm/fbchat/chat/${rootId}/`, previousPageData?.next || null];
    }
    return null;
  };

  const { data, size, setSize, isValidating } = useSWRInfinite<ChatMessagesResponse>(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      fallbackData: [initialData],
    },
  );

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await setSize(size + 1);
    setIsLoadingMore(false);
  };

  if (!data) return <div>Loading chat messages...</div>;

  // Flatten the results arrays from all pages
  const messages = data.flatMap((page) => page?.results || []);

  console.log(messages);

  // Check if there are more messages to load
  const hasMoreMessages = data[data.length - 1]?.next !== null;

  return (
    <div>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.body}</li>
        ))}
      </ul>
      {hasMoreMessages && (
        <button onClick={handleLoadMore} disabled={isLoadingMore || isValidating}>
          {isLoadingMore || isValidating ? "Loading..." : "Load More"}
        </button>
      )}
      {!hasMoreMessages && <div>No more messages to load.</div>}
    </div>
  );
};

export default ChatLogsInfiniteScroll;
