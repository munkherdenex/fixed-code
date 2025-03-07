import {
  EuiAvatar,
  EuiButtonIcon,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiPopover,
  useGeneratedHtmlId,
} from "@elastic/eui";
import moment from "moment";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import * as styles from "./chat.styles";
import { useState } from "react";

const messageBuble: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minWidth: "fit-content",
  paddingLeft: "10px",
};

const popeye: React.CSSProperties = {
  position: "absolute",
  right: "-25px",
  top: "15px",
};

const ticketSchema = yup
  .object({
    tt_id: yup.number().required(),
    category: yup.string().required(),
    cl_id: yup.number().required(),
    at_email: yup.string().required(),
  })
  .required();

type FormData = yup.InferType<typeof ticketSchema>;

const Popeye = () => {
  const [isPopoverOpen, setPopover] = useState(false);
  const customContextMenuPopoverId = useGeneratedHtmlId({
    prefix: "customContextMenuPopover",
  });

  // const ticketForm = useForm<FormData>({
  //   resolver: yupResolver(ticketSchema),
  //   defaultValues: {
  //     tt_id: undefined,
  //     category: "complaint",
  //     cl_id: selectedCall.id,
  //     at_email: undefined,
  //   },
  // });

  const closePopover = () => {
    setPopover(false);
  };

  const onButtonClick = () => {
    setPopover(!isPopoverOpen);
  };

  const button = <EuiButtonIcon size="xs" iconType={"boxesVertical"} onClick={onButtonClick} />;

  return (
    <div style={popeye}>
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
            Create ticket from chat
          </EuiContextMenuItem>
        </EuiContextMenuPanel>
      </EuiPopover>
    </div>
  );
};

const ChatMessage = ({ id, name, isToMe = false, message, timestamp = "now" }) => {
  const date = moment(timestamp);
  const formattedDate = date.format("MMMM D, HH:mm");

  return (
    <div
      key={"chat__message_" + id}
      className={`message-bubble ${isToMe ? "other-message" : "user-message"}`}
      css={[styles.messageBubble, isToMe ? styles.userMessage : styles.otherMessage]}
      onMouseEnter={(e) => {
        if (isToMe) {
          (e.currentTarget.querySelector(".message-actions") as HTMLDivElement).style.opacity = "1";
        }
      }}
      onMouseLeave={(e) => {
        if (isToMe) {
          (e.currentTarget.querySelector(".message-actions") as HTMLDivElement).style.opacity = "0";
        }
      }}
    >
      <EuiAvatar name={name} />
      <div style={messageBuble}>
        <p>{message}</p>
        <span css={styles.messageTimestamp}>{formattedDate}</span>
      </div>
      {/* <Popeye /> */}
      {isToMe && (
        <div className="message-actions" css={styles.messageActions}>
          {/* <button css={styles.actionButton}>Reply</button>
          <button css={styles.actionButton}>Forward</button> */}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
