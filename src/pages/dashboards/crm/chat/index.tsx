import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
} from "@elastic/eui";
import DashboardCRMChatLayout from "@/layouts/dashboard_crm_chat";
import { GetStaticProps } from "next/types";
import { css } from '@emotion/react';
import { ChatProvider } from "@/contexts/ChatContext";
import ChatGroupSelection from "@/components/chat/ChatGroupSelection";
import ChatList from "@/components/chat/ChatList";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatDetail from "@/components/chat/ChatDetail";
import SocketExample from "@/components/socket_example";

const chatCss = css`
  .root-chat-wrapper {
    border: 1px solid #ccc;
    border-radius: 5px;
    display: flex;
    flex-direction: row;
    padding: 10px 5px;
    cursor: pointer;
    transition: all 0.1s ease-out;
    margin-bottom: 8px;
  }
  .root-chat-wrapper:hover {
    background: #e6e6e6;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin: 5px;
  }
`;

const chatContainer = css`
  height: calc(100vh - 48px);
  max-height: calc(100vh - 48px);
  overflow-y: hidden;
`;

const Chat = () => {
  return (
    <>
      <style jsx global>{`${chatCss}`}</style>
      <ChatProvider>
        <DashboardCRMChatLayout>
          <EuiFlexGroup css={chatContainer} gutterSize='none'>
            {/* Left sidebar with chat groups and chat list */}
            <EuiFlexItem grow={1}>
              <ChatGroupSelection />
              <EuiHorizontalRule margin='xs' />
              <ChatList className='chat-list-container' />
            </EuiFlexItem>
            
            {/* Main chat area */}
            <EuiFlexItem grow={3} style={{ background: "#F7F8FC" }}>
              <ChatMessages />
            </EuiFlexItem>
            
            {/* Right sidebar with chat details */}
            <EuiFlexItem grow={1}>
              <ChatDetail />
            </EuiFlexItem>
          </EuiFlexGroup>
        </DashboardCRMChatLayout>
      </ChatProvider>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const common = (await import(`../../../../messages/${context.locale}/common.json`)).default;
  const chat = (await import(`../../../../messages/${context.locale}/chat.json`)).default;

  return {
    props: {
      messages: {
        ...common,
        ...chat,
      },
    },
  };
};

export default Chat;
