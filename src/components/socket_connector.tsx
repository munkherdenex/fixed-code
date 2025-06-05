import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../constants";

interface SocketConnectorProps {
  onMessage?: (eventName: string, data: any) => void;
  events?: string[];
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

const SocketConnector: React.FC<SocketConnectorProps> = ({
  onMessage,
  events = [],
  onConnected,
  onDisconnected,
  onError,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectingRef = useRef<boolean>(false);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const socketServerUrl = SOCKET_URL;
      let retryCount = 0;
      const MAX_RETRY_ATTEMPTS = 3; // Maximum number of retry attempts
      
      // Check if SOCKET_URL is empty
      if (!socketServerUrl) {
        console.error("Socket.IO URL is empty. Please check environment variables.");
        setError("Socket server URL is not configured");
        return;
      }
      
      const connectSocket = () => {
        // Don't try to reconnect if we're already reconnecting
        if (reconnectingRef.current) {
          return;
        }
        
        // Don't try to reconnect if we've reached max attempts
        if (retryCount >= MAX_RETRY_ATTEMPTS) {
          console.log(`Socket.IO connection failed after ${MAX_RETRY_ATTEMPTS} attempts. Giving up.`);
          setError(`Connection failed after ${MAX_RETRY_ATTEMPTS} attempts`);
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
          reconnection: false, // Disable auto reconnection so we can handle it manually
          transports: ['websocket', 'polling'] // Try websocket first, then fallback to polling
        });

        socketRef.current.on("connect", () => {
          // Reset retry count on successful connection
          retryCount = 0;
          reconnectingRef.current = false;
          setIsConnected(true);
          setError(null);
          if (onConnected) {
            onConnected();
          }
        });

        // Register all the events that we want to listen to
        if (events.length > 0 && onMessage) {
          events.forEach(eventName => {
            socketRef.current?.on(eventName, (data) => {
              onMessage(eventName, data);
            });
          });
        }

        socketRef.current.on("disconnect", (reason) => {
          console.log("Socket.IO disconnected:", reason);
          setIsConnected(false);
          
          if (onDisconnected) {
            onDisconnected();
          }
          
          // Only attempt to reconnect for certain disconnect reasons
          // io client disconnect is initiated by the client, so we don't reconnect
          if (reason !== "io client disconnect" && reason !== "io server disconnect") {
            reconnectingRef.current = true;
            setTimeout(() => {
              reconnectingRef.current = false;
              connectSocket();
            }, 2000);
          }
        });

        socketRef.current.on("connect_error", (error) => {
          console.error("Socket.IO connection error:", error);
          setError(error.message);
          if (onError) {
            onError(error);
          }
          
          // We'll handle reconnection manually based on our retry policy
          if (socketRef.current) {
            socketRef.current.disconnect();
          }
          
          if (retryCount < MAX_RETRY_ATTEMPTS) {
            reconnectingRef.current = true;
            console.log(`Retrying connection in 2 seconds... (Attempt ${retryCount}/${MAX_RETRY_ATTEMPTS})`);
            setTimeout(() => {
              reconnectingRef.current = false;
              connectSocket();
            }, 2000); // Try to reconnect after 2 seconds
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
  }, [events, onConnected, onDisconnected, onError, onMessage]);

  // This component doesn't render anything visible
  return null;
};

export default SocketConnector;