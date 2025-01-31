// @ts-nocheck

import { EuiAvatar } from "@elastic/eui";

import * as styles from "./chat.styles";

const ChatMessage = ({ id, name, isToMe = false, message, timestamp = "now" }) => {
  return (
    <div
      key={"chat__message_" + id}
      css={[styles.messageBubble, isToMe ? styles.userMessage : styles.otherMessage]}
      className="message-bubble other-message"
      onMouseEnter={(e) => {
        if (isToMe) {
          e.currentTarget.querySelector(".message-actions").style.opacity = 1;
        }
      }}
      onMouseLeave={(e) => {
        if (isToMe) {
          e.currentTarget.querySelector(".message-actions").style.opacity = 0;
        }
      }}
    >
      <EuiAvatar name={name} />
      <div css={styles.messageBubble}>
        <p>{message}</p>
        <span css={styles.messageTimestamp}>{timestamp}</span>
      </div>
      {isToMe && (
        <div className='message-actions' css={styles.messageActions}>
          <button css={styles.actionButton}>Reply</button>
          <button css={styles.actionButton}>Forward</button>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
