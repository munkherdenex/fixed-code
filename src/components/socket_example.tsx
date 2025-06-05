import React, { useState, useCallback } from "react";
import { EuiPanel, EuiText, EuiTitle, EuiSpacer, EuiCallOut } from "@elastic/eui";
import SocketConnector from "./socket_connector";

const SocketExample: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>("Disconnected");
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Define the events we want to listen to
  const eventsToListen = ["call_updated", "new_message", "status_change"];
  
  const handleMessage = useCallback((eventName: string, data: any) => {
    setLastMessage(`${eventName}: ${JSON.stringify(data)}`);
    // You can handle different events differently here
    switch (eventName) {
      case "call_updated":
        console.log("Call updated!", data);
        break;
      case "new_message":
        console.log("New message received!", data);
        break;
      case "status_change":
        console.log("Status changed!", data);
        break;
      default:
        console.log("Unknown event:", eventName, data);
    }
  }, []);
  
  const handleConnected = useCallback(() => {
    setConnectionStatus("Connected");
    setError(null);
  }, []);
  
  const handleDisconnected = useCallback(() => {
    setConnectionStatus("Disconnected");
  }, []);
  
  const handleError = useCallback((error: Error) => {
    setError(error.message);
  }, []);

  return (
    <EuiPanel>
      <EuiTitle>
        <h2>Socket.IO Connection Example</h2>
      </EuiTitle>
      <EuiSpacer />
      
      <EuiText>
        <p>
          <strong>Status:</strong> {connectionStatus}
        </p>
        {lastMessage && (
          <p>
            <strong>Last message:</strong> {lastMessage}
          </p>
        )}
      </EuiText>
      
      {error && (
        <>
          <EuiSpacer />
          <EuiCallOut title="Connection Error" color="danger">
            <p>{error}</p>
          </EuiCallOut>
        </>
      )}
      
      {/* The SocketConnector component handles the connection and doesn't render anything */}
      <SocketConnector
        events={eventsToListen}
        onMessage={handleMessage}
        onConnected={handleConnected}
        onDisconnected={handleDisconnected}
        onError={handleError}
      />
    </EuiPanel>
  );
};

export default SocketExample;