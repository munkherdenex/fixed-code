import React, { useEffect, useRef } from 'react';
import {
  EuiButton,
  EuiLoadingSpinner,
} from '@elastic/eui';
import { useChatContext } from '@/contexts/ChatContext';
import { css } from '@emotion/react';
import ChatMessage from './chat_message';
import { formatDate } from '@/utils/helper';

interface ChatMessagesProps {
  className?: string;
}

const chatStyles = css`
  .chat-container {
    background-color: #f9f9f9;
    border: 1px solid #ccc;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    min-height: 600px;
    height: 100%;
    width: 100%;
    }
    
  .message-list {
    overflow-y: auto;
    flex: 1;
    padding: 16px;
    min-height: 600px;
    max-height: 600px;
  }

  .message-bubble {
    border-radius: 12px;
    padding: 10px 15px;
    margin-bottom: 10px;
    max-width: 400px;
    clear: both;
    display: flex;
    align-items: flex-start;
    position: relative;
  }

  .user-message {
    background-color: #FCEAEE;
    float: right;
    align-self: flex-end;
    margin-left: auto;
  }

  .other-message {
    background-color: #ffffff;
    float: left;
    align-self: flex-start;
  }

  .message-timestamp {
    font-size: 12px;
    color: #999;
    margin-top: 5px;
    clear: both;
    order: 2;
    margin-left: auto;
    vertical-align: middle;
  }

  .message-content {
    order: 1;
    word-wrap: break-word;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin: 5px;
  }

  .user-avatar {
    margin-left: auto;
  }

  .input-area {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px;
    background-color: #f1f1f1;
    border-top: 1px solid #ccc;
    height: 60px;
    max-height: 60px;
  }

  .input-field {
    flex-grow: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-right: 5px;
  }

  .send-button {
    padding: 8px 12px;
    background-color: #4CAF50;
    border: none;
    color: white;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
  }

  .date-divider {
    display: flex;
    align-items: center;
    margin: 20px 0;
    clear: both;
    justify-content: center;
  }
  
  .date-text {
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 12px;
    color: #666;
    margin: 0 10px;
    text-align: center;
  }

  .loading-older {
    padding: 10px;
    text-align: center;
    width: 100%;
  }
`;

const ChatMessages: React.FC<ChatMessagesProps> = ({ className }) => {
  const {
    selectedChatId,
    selectedChatFbProfile,
    messages,
    message,
    setMessage,
    isLoading,
    isValidating,
    isLoadingOlderMessages,
    errorMessage,
    handleSendMessage,
    handleKeyPress,
    chatContainerRef,
    lastChatRef,
    fetchMoreMessages,
    hasMoreMessages
  } = useChatContext();
  
  // Store scroll position information
  const scrollHeightBeforeLoad = useRef(0);
  const scrollTopBeforeLoad = useRef(0);
  
  // Handle scrolling to load more messages
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      // If we're near the top (within 50px) and have more messages to fetch and not already loading
      if (container.scrollTop < 50 && hasMoreMessages && !isLoadingOlderMessages && !isValidating) {
        // Store current scroll position before loading
        scrollHeightBeforeLoad.current = container.scrollHeight;
        scrollTopBeforeLoad.current = container.scrollTop;
        
        // Fetch older messages
        fetchMoreMessages();
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [chatContainerRef, hasMoreMessages, isLoadingOlderMessages, isValidating, fetchMoreMessages]);
  
  // Preserve scroll position after loading more messages
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container && scrollHeightBeforeLoad.current > 0) {
      // Calculate how much new content was added
      const newContentHeight = container.scrollHeight - scrollHeightBeforeLoad.current;
      // Adjust scroll position to show the same content as before
      if (newContentHeight > 0) {
        container.scrollTop = scrollTopBeforeLoad.current + newContentHeight;
      }
      // Reset stored values
      scrollHeightBeforeLoad.current = 0;
      scrollTopBeforeLoad.current = 0;
    }
  }, [messages.length, chatContainerRef]);

  if (!selectedChatId) {
    return (
      <div className={`${className} chat-container`} css={chatStyles}>
        <div className="message-list" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          Сонгосон чатыг энд харуулна.
        </div>
      </div>
    );
  }

  // Show loading indicator when first loading a chat's messages
  if (isValidating && messages.length === 0) {
    return (
      <div className={`${className} chat-container`} css={chatStyles}>
        <div className="message-list" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <EuiLoadingSpinner size="xl" />
        </div>
      </div>
    );
  }

  // Sort messages in ascending order by date (newest on the bottom)
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Function to format date for display
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Өнөөдөр';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Өчигдөр';
    } else {
      return formatDate(date, "YYYY-MM-DD");
    }
  };

  // Function to check if the date has changed between messages
  const hasDateChanged = (currentDate: string, prevDate: string | null) => {
    if (!prevDate) return true;
    
    const current = new Date(currentDate);
    const prev = new Date(prevDate);
    
    return current.toDateString() !== prev.toDateString();
  };

  return (
    <div className={`${className} chat-container`} css={chatStyles}>
      <div className="message-list" ref={chatContainerRef}>
        {/* Loading indicator for older messages */}
        {(isLoadingOlderMessages || (isValidating && messages.length > 0)) && hasMoreMessages && (
          <div className="loading-older">
            <EuiLoadingSpinner size="m" />
          </div>
        )}
        {sortedMessages.map((chatMessage, index) => {
          const isSentByUser = !chatMessage.chat_from;
          const isFirstMessage = index === 0; 
          
          // Check if date has changed from previous message
          const prevMessage = index > 0 ? sortedMessages[index - 1] : null;
          const dateChanged = hasDateChanged(
            chatMessage.created_at,
            prevMessage?.created_at || null
          );
          
          // Create a reference element for the first message when we have more to load
          const messageElement = (
            <ChatMessage
              id={chatMessage.id}
              name={isSentByUser ? null : selectedChatFbProfile?.name}
              fbProfile={isSentByUser ? null : selectedChatFbProfile}
              isToMe={!isSentByUser}
              message={chatMessage.body}
              timestamp={chatMessage.created_at}
            />
          );
          
          return (
            <React.Fragment key={chatMessage.id}>
              {dateChanged && (
                <div className="date-divider">
                  <div className="date-text">
                    {formatMessageDate(chatMessage.created_at)}
                  </div>
                </div>
              )}
              
              {/* If this is the first message and we have more messages, apply the ref */}
              {isFirstMessage && hasMoreMessages ? (
                <div ref={lastChatRef}>
                  {messageElement}
                </div>
              ) : (
                messageElement
              )}
            </React.Fragment>
          );
        })}
        {errorMessage && (
          <div style={{ color: 'red', textAlign: 'center', margin: '10px 0' }}>
            {errorMessage}
          </div>
        )}
      </div>
      <div className="input-area">
        <textarea
          className="input-field"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          />
        <EuiButton
          fill
          onClick={handleSendMessage}
          isLoading={isLoading}
          isDisabled={isLoading || message.trim() === ''}
        >
          Send
        </EuiButton>
      </div>
    </div>
  );
};

export default ChatMessages;