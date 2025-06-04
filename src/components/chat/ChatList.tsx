import React from 'react';
import {
  EuiAvatar,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiTab,
  EuiTabs,
  EuiBadge,
  EuiIcon
} from '@elastic/eui';
import { useChatContext } from '@/contexts/ChatContext';
import moment from 'moment';
import { extractMessage, getImgUrl } from '@/components/chat/utils';
import { css } from '@emotion/react';

interface ChatListProps {
  className?: string;
}

const chatListStyles = css`
  .list-container {
    height: calc(100vh - 180px);
    overflow-y: auto;
  }

  .chat-item {
    display: flex;
    padding: 12px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .chat-item:hover {
    background: rgba(0, 119, 204, 0.10);
  }
  
  .chat-item.active {
    background: rgba(0, 119, 204, 0.10);
  }

  .avatar-container {
    margin-right: 12px;
    position: relative;
  }

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }

  .source-badge {
    position: absolute;
    bottom: 0;
    right: -2px;
    background: white;
    border-radius: 50%;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .source-icon {
    width: 12px;
    height: 12px;
  }

  .chat-content {
    flex: 1;
    overflow: hidden;
  }

  .chat-source {
    color: #69707D;
    font-size: 12px;
    margin-bottom: 4px;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .chat-name {
    font-weight: 500;
    font-size: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chat-time {
    color: #7d8594;
    font-size: 12px;
    white-space: nowrap;
  }

  .chat-message {
    color: #7d8594;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .notification-badge {
    background-color: #e8488a !important;
    color: white !important;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 10px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 8px;
  }

  .tabs-container {
    padding: 0 16px;
  }
  
  .loading-more {
    padding: 10px;
    text-align: center;
  }
`;

const ChatList: React.FC<ChatListProps> = ({ className }) => {
  const {
    rootChatLogs,
    isLoadingRootChat,
    isErrorRootChat,
    isValidatingRootChats,
    hasMoreRootChats,
    currentRootChatTab,
    chatGroups,
    setCurrentRootChatTab,
    handleClickChat,
    selectedChatId,
    setSelectedChatId,
    setSelectedPageId,
    setSelectedChatFbProfile,
    setMessage,
    mutateMessages,
    lastRootChatRef,
    rootChatContainerRef
  } = useChatContext();

  // Function to handle tab selection
  const onSelectRootChatTab = (tabId: string) => {
    // Only take action if we're actually changing tabs
    if (currentRootChatTab !== tabId) {
      setCurrentRootChatTab(tabId);
      
      // Reset the selected chat profile and messages when switching tabs
      setSelectedChatId(null);
      setSelectedPageId(null); 
      setSelectedChatFbProfile(null);
      setMessage("");
      mutateMessages();
    }
  };

  // Get chat source icon
  const getChatSourceIcon = (source: string) => {
    if (source.includes('Pocket app Facebook')) {
      return (
        <div className="source-badge">
          <img 
            src="/images/pocket-logo.png" 
            alt="Pocket Facebook" 
            className="source-icon"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%231877F2' d='M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z'/%3E%3C/svg%3E";
            }}
          />
        </div>
      );
    } else if (source.includes('Pocket Web')) {
      return (
        <div className="source-badge">
          <img 
            src="/images/pocket-logo.png" 
            alt="Pocket Web" 
            className="source-icon"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23888888' d='M352 256c0 22.2-1.2 43.6-3.3 64H163.3c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64H348.7c2.2 20.4 3.3 41.8 3.3 64zm28.8-64H503.9c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64H380.8c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32H376.7c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0H167.7c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0H18.6C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192H131.2c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64H8.1C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6H344.3c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352H135.3zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6H493.4z'/%3E%3C/svg%3E";
            }}
          />
        </div>
      );
    } else if (source.includes('Facebook') || source.includes('facebook')) {
      return (
        <div className="source-badge">
          <img 
            src="/images/facebook-icon.png" 
            alt="Facebook" 
            className="source-icon"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%231877F2' d='M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z'/%3E%3C/svg%3E";
            }}
          />
        </div>
      );
    } else if (source.includes('Web') || source.includes('web')) {
      return (
        <div className="source-badge">
          <img 
            src="/images/globe-icon.png" 
            alt="Web" 
            className="source-icon"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23888888' d='M352 256c0 22.2-1.2 43.6-3.3 64H163.3c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64H348.7c2.2 20.4 3.3 41.8 3.3 64zm28.8-64H503.9c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64H380.8c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32H376.7c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0H167.7c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0H18.6C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192H131.2c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64H8.1C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6H344.3c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352H135.3zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6H493.4z'/%3E%3C/svg%3E";
            }}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className} css={chatListStyles}>
      <div className="tabs-container">
        <EuiTabs>
          <EuiTab
            key={'open-chats-tab'}
            onClick={() => onSelectRootChatTab('open-chats-tab')}
            isSelected={currentRootChatTab === 'open-chats-tab'}
          >
            Нээлттэй
          </EuiTab>
          <EuiTab
            key={'closed-chats-tab'}
            onClick={() => onSelectRootChatTab('closed-chats-tab')}
            isSelected={currentRootChatTab === 'closed-chats-tab'}
          >
            Хаалттай
          </EuiTab>
        </EuiTabs>
      </div>

      {isLoadingRootChat && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <EuiLoadingSpinner size="xl" />
        </div>
      )}
      
      {isErrorRootChat && 
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Чатны жагсаалтыг авахад алдаа гарлаа.
        </div>
      }
      
      <div className="list-container" ref={rootChatContainerRef}>
        {!isLoadingRootChat && rootChatLogs && rootChatLogs?.length > 0 ? (
          rootChatLogs
          .slice()
          .sort(
            (a, b) =>
              new Date(b.last_active_at).getTime() - new Date(a.last_active_at).getTime(),
          ).map((rootChat, index) => {
            const isActive = selectedChatId === rootChat.id;
            // Check if this is the last item to attach the ref for infinite scrolling
            const isLastItem = index === rootChatLogs.length - 1;
            
            return (
              <div 
                key={rootChat.id}
                className={`chat-item ${isActive ? 'active' : ''}`}
                onClick={() =>
                  handleClickChat(
                    rootChat,
                    rootChat.id,
                    rootChat.fb_profile.psid,
                    rootChat.fb_profile,
                  )
                }
                ref={isLastItem ? lastRootChatRef : undefined}
              >
                <div className="avatar-container">
                  <EuiAvatar
                    name={rootChat.fb_profile.name}
                    imageUrl={getImgUrl(rootChat.fb_profile.picture)}
                    size="l"
                    className="avatar"
                  />
                  {getChatSourceIcon(rootChat.source_id || '')}
                </div>
                
                <div className="chat-content">
                  <div className='chat-source'>
                    <span><EuiIcon type='globe'/> {chatGroups.find(group => group.id === rootChat.source_id)?.name || rootChat.source_id}</span>
                  </div>
                  <div className="chat-header">
                    <div className="chat-name">{rootChat.fb_profile.name}</div>
                    <div className="chat-time">{moment(rootChat.last_active_at).format('HH:mm')}</div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="chat-message">
                      {extractMessage(rootChat.body, true)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (!isLoadingRootChat && 
          <div className="chat-item">
            Чат байхгүй байна.
          </div>
        )}
        
        {/* Loading indicator for infinite scrolling */}
        {(isValidatingRootChats && hasMoreRootChats && !isLoadingRootChat) && (
          <div className="loading-more">
            <EuiLoadingSpinner size="m" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;