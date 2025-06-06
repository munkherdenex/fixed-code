import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useMemo } from 'react';
import fbPageConfigApi, { FBPageConfig, FBPageConfigResponse } from "@/api/fb_page_config";
import useGetRootChatLogs from "@/hooks/useGetRootChatLogs";
import contactLogApi from "@/api/contact_log";
import axios from "axios";
import useSWRInfinite from "swr/infinite";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../constants";

// Define interfaces
export interface FbProfile {
  psid: number;
  first_name: string;
  last_name: string;
  middle_name: string;
  name: string;
  name_format: string;
  picture: string;
  short_name: string;
}

export interface ChatMessage {
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
  isOptimistic?: boolean;
}

export interface ChatMessagesResponse {
  next: string | null;
  previous: string | null;
  results: ChatMessage[];
}

export interface ChatGroup {
  id: string;
  name: string;
  type: 'facebook' | 'embedded' | 'other';
  icon?: string;
  active: boolean;
}

export interface RootChat {
  id: string;
  fb_profile: FbProfile;
  body: string;
  source_id: string;
  created_at: string;
  last_active_at: string;
  customer?: {
    id: number;
    email?: string;
    phone?: string;
  };
}

// Context type
interface ChatContextType {
  // Chat groups
  chatGroups: ChatGroup[];
  selectedChatGroup: ChatGroup | null;
  isLoadingChatGroups: boolean;
  setChatGroups: React.Dispatch<React.SetStateAction<ChatGroup[]>>;
  setSelectedChatGroup: React.Dispatch<React.SetStateAction<ChatGroup | null>>;
  fetchChatGroups: () => Promise<void>;
  
  // Root chat tabs
  currentRootChatTab: string;
  setCurrentRootChatTab: React.Dispatch<React.SetStateAction<string>>;
  
  // Source filter for chat logs
  sourceId: string | null;
  setSourceId: React.Dispatch<React.SetStateAction<string | null>>;
  
  // Chat selection
  selectedChatId: string | null;
  selectedPageId: string | null;
  selectedChatFbProfile: FbProfile | null;
  setSelectedChatId: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedPageId: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedChatFbProfile: React.Dispatch<React.SetStateAction<FbProfile | null>>;
  handleClickChat: (rootChat: RootChat, rootId: string, fbUserId: number, fbProfile: FbProfile) => void;
  
  // Messages
  messages: ChatMessage[];
  hasMoreMessages: boolean;
  isValidating: boolean;
  isLoadingOlderMessages: boolean;
  fetchMoreMessages: () => void;
  mutateMessages: () => Promise<any>;
  
  // Message sending
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  errorMessage: string | null;
  handleSendMessage: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  
  // Root chat logs
  rootChatLogs: RootChat[] | undefined;
  isLoadingRootChat: boolean;
  isErrorRootChat: boolean;
  hasMoreRootChats: boolean;
  isValidatingRootChats: boolean;
  loadMoreRootChats: () => void;
  lastRootChatRef: (node: HTMLDivElement) => void;
  rootChatContainerRef: React.RefObject<HTMLDivElement>;

  // Refs
  chatContainerRef: React.RefObject<HTMLDivElement>;
  lastChatRef: (node: HTMLDivElement) => void;
  
  // Utilities
  scrollToBottom: () => void;

  // Socket connection status
  socketConnected: boolean;
}

// Create context with a default value
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider component
interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  // Chat groups state
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [selectedChatGroup, setSelectedChatGroup] = useState<ChatGroup | null>(null);
  const [isLoadingChatGroups, setIsLoadingChatGroups] = useState(false);
  
  // Tab state
  const [currentRootChatTab, setCurrentRootChatTab] = useState<string>('open-chats-tab');
  
  // Source ID for filtering chat logs
  const [sourceId, setSourceId] = useState<string | null>(null);
  
  // Chat selection state
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedChatFbProfile, setSelectedChatFbProfile] = useState<FbProfile | null>(null);
  
  // Chat input state
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Refs
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const isLoadingOlderMessagesRef = React.useRef<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  
  // Fetch chat logs with status based on the selected tab and source_id based on selected chat group
  const { 
    rootChatLogs, 
    isLoadingRootChat, 
    isErrorRootChat,
    hasMoreRootChats,
    loadMoreRootChats,
    isValidatingRootChats
  } = useGetRootChatLogs(
    sourceId, 
    currentRootChatTab === 'open-chats-tab' ? 'active' : 'archive'
  );
  
  // Root chat logs list observer for infinite scrolling
  const rootChatContainerRef = React.useRef<HTMLDivElement>(null);
  const rootChatObserver = React.useRef<IntersectionObserver | null>(null);
  
  // Last item callback for root chat logs
  const lastRootChatRef = React.useCallback(
    (node: HTMLDivElement) => {
      if (isValidatingRootChats) return;
      if (rootChatObserver.current) rootChatObserver.current.disconnect();
      rootChatObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreRootChats && !isValidatingRootChats) {
          loadMoreRootChats();
        }
      });
      if (node) rootChatObserver.current.observe(node);
    },
    [isValidatingRootChats, hasMoreRootChats, loadMoreRootChats]
  );

  // Chat message fetcher
  const fetcher = (url: string) => axios.get<ChatMessagesResponse>(url).then((res) => res.data);
  
  const getKey = (pageIndex: number, previousPageData: ChatMessagesResponse | null) => {
    if (selectedChatId) {
      if (previousPageData && !previousPageData.next) return null;
      if (pageIndex === 0) return `/api/v1/dj/crm/fbchat/chat/${selectedChatId}/`;
      return (
        `/api/v1/dj/crm/fbchat/chat/${selectedChatId}/?cursor=` + (previousPageData?.next ?? null)
      );
    }
    return null;
  };
  
  const { data, size, setSize, isValidating, mutate } = useSWRInfinite<ChatMessagesResponse>(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      fallbackData: [],
    },
  );

  const messages = data?.flatMap((page) => page?.results || []) || [];
  const hasMoreMessages = data?.[data.length - 1]?.next !== null;

  // Observer for infinite scroll
  const observer = React.useRef<IntersectionObserver | null>(null);
  const lastChatRef = React.useCallback(
    (node: HTMLDivElement) => {
      if (isValidating) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreMessages) {
          // Set flag to indicate we're loading older messages
          isLoadingOlderMessagesRef.current = true;
          setSize(size + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isValidating, hasMoreMessages, size, setSize],
  );

  // Functions
  const fetchChatGroups = async () => {
    try {
      setIsLoadingChatGroups(true);
      const response: FBPageConfigResponse = await fbPageConfigApi.getList();
      
      // Create a default "All Pages" option
      const allPagesOption: ChatGroup = {
        id: "all",
        name: "Бүх хуудас",
        type: 'other' as const,
        active: true,
      };
      
      // Convert FB page configs to ChatGroup format
      const chatGroupsFromPages = response.results.map(page => ({
        id: page.page_id,
        name: page.page_name || 'Unnamed Page',
        type: 'facebook' as const,
        active: page.is_enabled,
      }));
      
      // Add the "All Pages" option at the top
      setChatGroups([allPagesOption, ...chatGroupsFromPages]);
      
      // Set initial selected chat group if not already set
      if (!selectedChatGroup) {
        setSelectedChatGroup(allPagesOption);
      }
    } catch (error) {
      console.error("Error fetching chat groups:", error);
    } finally {
      setIsLoadingChatGroups(false);
    }
  };

  const handleClickChat = (rootChat: RootChat, rootId: string, fbUserId: number, fbProfile: FbProfile) => {
    setSelectedChatId(rootId);
    setSelectedPageId(rootChat.source_id);
    setSelectedChatFbProfile(fbProfile);
    setMessage(""); // Reset message input field when a new chat is selected
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedPageId || !selectedChatFbProfile) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);

      await mutate(async (pages: any) => {
        const optimisticMessage = {
          id: Date.now(),
          body: message.trim(),
          created_at: new Date().toISOString(),
          isOptimistic: true,
        };

        return (
          pages?.map((page: any, index: number) =>
            index === 0 ? { ...page, results: [optimisticMessage, ...(page.results || [])] } : page,
          ) || []
        );
      }, false);

      await contactLogApi.sendChat({
        page_id: selectedPageId,
        psid: selectedChatFbProfile.psid,
        text: message.trim(),
      });

      setMessage("");
      // Scroll to bottom after sending a message
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      mutate();
      setErrorMessage("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Effects
  useEffect(() => {
    fetchChatGroups();
  }, []);

  // Socket.IO connection setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const socketServerUrl = SOCKET_URL;
      let retryCount = 0;
      const MAX_RETRY_ATTEMPTS = 3; // Maximum retry attempts
      
      // Check if SOCKET_URL is empty
      if (!socketServerUrl) {
        console.error("Socket.IO URL is empty. Please check environment variables.");
        return;
      }
      
      const connectSocket = () => {
        // Don't try to reconnect if we've reached max attempts
        if (retryCount >= MAX_RETRY_ATTEMPTS) {
          console.log(`Socket.IO connection failed after ${MAX_RETRY_ATTEMPTS} attempts. Giving up.`);
          return;
        }
        
        retryCount++;
        console.log(`Socket.IO connection attempt ${retryCount}/${MAX_RETRY_ATTEMPTS}`);
        
        // Clean up any existing socket connection
        if (socketRef.current) {
          socketRef.current.removeAllListeners();
          socketRef.current.disconnect();
        }
        
        // Create new socket connection
        socketRef.current = io(socketServerUrl, {
          reconnection: false, // Disable auto reconnection to handle it manually
          transports: ['websocket', 'polling'] // Try websocket first, then fallback to polling
        });

        socketRef.current.on("connect", () => {
          console.log("Socket.IO connected");
          // Reset retry count on successful connection
          retryCount = 0;
          setSocketConnected(true);
        });

        // Listen for new chat messages
        socketRef.current.on("new_message", (socket_data) => {
          console.log("New message received:", socket_data);
          const data = socket_data.data;
          
          // Only handle the message if it belongs to the currently selected chat
          if (data.chat_parent === selectedChatId) {
            mutate(async (pages: any) => {
              // Format the incoming message to match our ChatMessage structure
              const newMessage: ChatMessage = {
                id: data.id || Date.now(),
                customer_id: data.customer_id || null,
                type: data.type || 'text',
                body: data.body || data.message,
                source: data.source || 'facebook',
                email: data.email || null,
                phone: data.phone || null,
                team_id: data.team_id || null,
                chat_is_root: false,
                chat_id: data.chat_id,
                chat_state: data.chat_state || null,
                status: data.status || 'active',
                created_at: data.created_at || new Date().toISOString(),
                updated_at: data.updated_at || new Date().toISOString(),
                chat_parent: data.chat_parent || 0,
                chat_from: data.chat_from || 0, // If 0, it's from the user (us)
                chat_to: data.chat_to || null,
                created_by: data.created_by || null,
                updated_by: data.updated_by || null
              };
              
              // Add the new message to the first page of messages
              return pages?.map((page: any, index: number) =>
                index === 0 ? { ...page, results: [...(page.results || []), newMessage] } : page
              ) || [];
            }, false);
            
            // Scroll to bottom after receiving a new message
            setTimeout(scrollToBottom, 100);
          } else {
            // If message is for another chat, we could update unread counts or provide a notification
            console.log("Message received for a different chat:", data.chat_parent);
            // TODO: Implement notification or unread count update
          }
        });

        // Listen for chat status changes (like marking as read, etc.)
        socketRef.current.on("chat_status_update", (data) => {
          console.log("Chat status updated:", data);
          // Handle chat status updates if needed
        });

        socketRef.current.on("disconnect", (reason) => {
          console.log("Socket.IO disconnected:", reason);
          setSocketConnected(false);
          
          // Only attempt to reconnect for certain disconnect reasons
          if (reason !== "io client disconnect" && reason !== "io server disconnect") {
            setTimeout(() => {
              connectSocket();
            }, 2000);
          }
        });

        socketRef.current.on("connect_error", (error) => {
          console.error("Socket.IO connection error:", error);
          
          // We'll handle reconnection manually based on our retry policy
          if (socketRef.current) {
            socketRef.current.disconnect();
          }
          
          if (retryCount < MAX_RETRY_ATTEMPTS) {
            console.log(`Retrying connection in 2 seconds... (Attempt ${retryCount}/${MAX_RETRY_ATTEMPTS})`);
            setTimeout(connectSocket, 2000); // Try to reconnect after 2 seconds
          }
        });
      };
      
      // Initial connection attempt
      connectSocket();

      return () => {
        if (socketRef.current) {
          socketRef.current.removeAllListeners();
          socketRef.current.disconnect();
        }
      };
    }
  }, []); // Empty dependency array to ensure socket connection is only established once

  // Effect to subscribe to specific chat room when a chat is selected
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected && selectedChatId) {
      // Join the chat room for real-time updates
      socketRef.current.emit('join_chat', { chat_id: selectedChatId });
      
      // When leaving this chat, we can clean up
      return () => {
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit('leave_chat', { chat_id: selectedChatId });
        }
      };
    }
  }, [selectedChatId, socketConnected]);

  // Effect to scroll to bottom when messages change or a new chat is selected
  useEffect(() => {
    if (messages.length > 0 && !isLoadingOlderMessagesRef.current) {
      scrollToBottom();
    }
    // Reset the flag after the effect runs
    isLoadingOlderMessagesRef.current = false;
  }, [messages.length, selectedChatId]);

  // Root chat logs
  const sortedRootChatLogs = useMemo(() => {
    if (!rootChatLogs) return undefined;
    
    // Create a copy before sorting to avoid mutation
    return [...rootChatLogs].sort((a, b) => 
      new Date(b.last_active_at).getTime() - new Date(a.last_active_at).getTime()
    );
  }, [rootChatLogs]);

  const value = {
    // Chat groups
    chatGroups,
    selectedChatGroup,
    isLoadingChatGroups,
    setChatGroups,
    setSelectedChatGroup,
    fetchChatGroups,
    
    // Root chat tabs
    currentRootChatTab,
    setCurrentRootChatTab,
    
    // Source filter for chat logs
    sourceId,
    setSourceId,
    
    // Chat selection
    selectedChatId,
    selectedPageId,
    selectedChatFbProfile,
    setSelectedChatId,
    setSelectedPageId,
    setSelectedChatFbProfile,
    handleClickChat,
    
    // Messages
    messages,
    hasMoreMessages,
    isValidating,
    isLoadingOlderMessages: isLoadingOlderMessagesRef.current,
    fetchMoreMessages: () => setSize(size + 1),
    mutateMessages: () => mutate(),
    
    // Message sending
    message,
    setMessage,
    isLoading,
    errorMessage,
    handleSendMessage,
    handleKeyPress,
    
    // Root chat logs
    rootChatLogs: sortedRootChatLogs,
    isLoadingRootChat,
    isErrorRootChat,
    hasMoreRootChats,
    isValidatingRootChats,
    loadMoreRootChats,
    lastRootChatRef,
    rootChatContainerRef,
    
    // Refs
    chatContainerRef,
    lastChatRef,
    
    // Utilities
    scrollToBottom,
    
    // Socket connection status
    socketConnected,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Custom hook for using the context
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};