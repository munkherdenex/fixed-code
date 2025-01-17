import {
  EuiAvatar,
  EuiButtonIcon,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiListGroup,
  EuiListGroupItem,
  EuiPage,
  EuiPageBody,
  EuiPageSidebar,
  EuiPopover,
  useGeneratedHtmlId,
} from "@elastic/eui";
import DashboardCRMLayout from "../../../../layouts/dashboard_crm";
import { useState } from "react";
import ChatMessage from '../../../../components/chat/chat_message';

const chatCss = `
  .chat-container {
    border: 1px solid #ccc;
    border-radius: 5px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 500px;
  }

  .message-list {
    padding: 10px;
    overflow-y: auto; /* Enables vertical scrolling */
    flex-grow: 1; /* Allows message list to take up available space */
  }

  .message-bubble {
    border: 1px solid #ccc;
    border-radius: 20px;
    padding: 10px 5px;
    margin-bottom: 10px;
    max-width: 70%;
    clear: both;
    display: flex;
    align-items: flex-start;
    position: relative;
  }

  .user-message {
    background-color: #e0f2f7;
    float: right;
    align-self: flex-end;
  }

  .other-message {
    background-color: #ffffff;
    float: left;
    align-self: flex-start; /* Align other messages to the left */
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

  .message-content{
    order: 1;
    word-wrap: break-word;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin: 5px;
  }
  .user-avatar{
    margin-left: auto;
  }

  .input-area {
    border-top: 1px solid #ccc;
    padding: 10px;
    display: flex;
  }

  .input-field {
    flex-grow: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-right: 5px;
  }
  .send-button{
    padding: 8px 12px;
    background-color: #4CAF50; /* Green */
    border: none;
    color: white;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
  }


`;

const Popeye = () => {
  const [isPopoverOpen, setPopover] = useState(false);
  const customContextMenuPopoverId = useGeneratedHtmlId({
    prefix: "customContextMenuPopover",
  });

  const closePopover = () => {
    setPopover(false);
  };

  const onButtonClick = () => {
    setPopover(!isPopoverOpen);
  };

  const button = <EuiButtonIcon size="xs" iconType={"boxesVertical"} onClick={onButtonClick} />;

  return (
    <EuiPopover
      id={customContextMenuPopoverId}
      button={button}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      panelPaddingSize="none"
      anchorPosition="downLeft"
    >
      <EuiContextMenuPanel>
        <EuiContextMenuItem key="item-1" icon="indexOpen" size="s" onClick={closePopover}>
          Add a field to this data view
        </EuiContextMenuItem>
        <EuiContextMenuItem key="item-2" icon="indexSettings" size="s" onClick={closePopover}>
          Manage this data view
        </EuiContextMenuItem>
      </EuiContextMenuPanel>
    </EuiPopover>
  );
};

const Chat = () => {
  const [sideBar, setSideBar] = useState(true);

  const listGroupLinkId__1 = useGeneratedHtmlId({
    prefix: "listGroupLink",
    suffix: "first",
  });
  const listGroupLinkId__2 = useGeneratedHtmlId({
    prefix: "listGroupLink",
    suffix: "second",
  });
  const listGroupLinkId__3 = useGeneratedHtmlId({
    prefix: "listGroupLink",
    suffix: "third",
  });
  const listGroupLinkId__4 = useGeneratedHtmlId({
    prefix: "listGroupLink",
    suffix: "fourth",
  });
  const listGroupLinkId__5 = useGeneratedHtmlId({
    prefix: "listGroupLink",
    suffix: "fifth",
  });

  return (
    <>
      <style>{chatCss}</style>
      <DashboardCRMLayout>
        <EuiPage paddingSize="none" grow={true}>
          {sideBar && (
            <EuiPageSidebar paddingSize="none">
              <EuiListGroup maxWidth={288}>
                <EuiListGroupItem
                  id={listGroupLinkId__1}
                  iconType="bullseye"
                  label="EUI button link"
                  onClick={() => {}}
                  isActive
                  extraAction={{
                    color: "text",
                    iconType: "starEmpty",
                    iconSize: "s",
                    "aria-label": "Favorite link1",
                    alwaysShow: true,
                  }}
                />

                <EuiListGroupItem
                  id={listGroupLinkId__2}
                  iconType="visualizeApp"
                  onClick={() => {}}
                  label="EUI button link"
                  extraAction={{
                    color: "text",
                    iconType: "starEmpty",
                    iconSize: "s",
                    "aria-label": "Favorite link2",
                    alwaysShow: false,
                  }}
                />

                <EuiListGroupItem
                  id={listGroupLinkId__3}
                  iconType="lensApp"
                  iconProps={{ color: "default" }}
                  onClick={() => {}}
                  label="EUI button link"
                  extraAction={{
                    color: "text",
                    iconType: "starFilled",
                    iconSize: "s",
                    "aria-label": "Favorite link3",
                    alwaysShow: true,
                  }}
                />

                <EuiListGroupItem
                  id={listGroupLinkId__4}
                  onClick={() => {}}
                  iconType="broom"
                  label="EUI button link"
                  extraAction={{
                    color: "text",
                    iconType: "starEmpty",
                    iconSize: "s",
                    "aria-label": "Favorite link4",
                    alwaysShow: true,
                    isDisabled: true,
                  }}
                />

                <EuiListGroupItem
                  id={listGroupLinkId__5}
                  iconType="brush"
                  isDisabled
                  label="EUI button link"
                  extraAction={{
                    color: "text",
                    iconType: "starEmpty",
                    iconSize: "s",
                    "aria-label": "Favorite link4",
                  }}
                />
              </EuiListGroup>
            </EuiPageSidebar>
          )}
          <EuiPageBody paddingSize="m" panelled={true}>
            <div className="chat-container">
              <div className="message-list">
                <div className="message-bubble other-message">
                  <EuiAvatar name="Raphael" />
                  <div className="message-content">
                    <p>.</p>
                    <span className="message-timestamp">10:00 AM</span>
                  </div>
                  <div className="message-actions">
                    <button className="action-button">Reply</button>
                    <button className="action-button">Forward</button>
                  </div>
                </div>
                <div className="message-bubble user-message">
                  <img src="https://placehold.co/40" alt="Avatar" className="avatar user-avatar" />
                  <div className="message-content">
                    <p>I have a question about my account.</p>
                    <span className="message-timestamp">10:01 AM</span>
                  </div>
                </div>
                <div className="message-bubble other-message">
                  <img src="https://placehold.co/40" alt="Avatar" className="avatar" />
                  <div className="message-content">
                    <p>Sure, I can help with that. What is your question?</p>
                    <span className="message-timestamp">10:02 AM</span>
                    <Popeye />
                  </div>
                </div>
                <div className="message-bubble user-message">
                  <img src="https://placehold.co/40" alt="Avatar" className="avatar user-avatar" />
                  <div className="message-content">
                    <p>I forgot my password.</p>
                    <span className="message-timestamp">10:03 AM</span>
                  </div>
                </div>
                <div className="message-bubble other-message">
                  <img src="https://placehold.co/40" alt="Avatar" className="avatar" />
                  <div className="message-content">
                    <p>No problem! Let me guide you through the password reset process.</p>
                    <span className="message-timestamp">10:04 AM</span>
                    <Popeye />
                  </div>
                </div>
                <div className="message-bubble user-message">
                  <img src="https://placehold.co/40" alt="Avatar" className="avatar user-avatar" />
                  <div className="message-content">
                    <p>I forgot my password.</p>
                    <span className="message-timestamp">10:03 AM</span>
                  </div>
                </div>
                <div className="message-bubble other-message">
                  <img src="https://placehold.co/40" alt="Avatar" className="avatar" />
                  <div className="message-content">
                    <p>No problem! Let me guide you through the password reset process.</p>
                    <span className="message-timestamp">10:04 AM</span>
                    <Popeye />
                  </div>
                </div>

                <ChatMessage id={1} isToMe={true} name={"User One"} message={"This is msg."} />
                <ChatMessage id={2} isToMe={false} name={"Worker me"} message={"This is msg."} />
              </div>
              <div className="input-area">
                <input type="text" className="input-field" placeholder="Type a message..." />
                <button className="send-button">Send</button>
              </div>
            </div>
          </EuiPageBody>
        </EuiPage>
      </DashboardCRMLayout>
    </>
  );
};

export default Chat;
