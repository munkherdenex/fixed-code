// @ts-nocheck

import {
  EuiAvatar,
  EuiButtonIcon,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiPopover,
  useGeneratedHtmlId,
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiSwitch,
  EuiFieldText,
  EuiSuperSelect,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  ExampleForm,
  EuiModalFooter,
  EuiSelect,
  EuiTextArea,
  EuiSpacer,
} from "@elastic/eui";
import moment from "moment";
import * as yup from "yup";
import * as styles from "./chat.styles";
import { useState } from "react";
import Image from "next/image";
import { extractMessage, getImgUrl } from "./utils";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import useTeams from "@/hooks/useTeams";
import { Teams } from "@/store/teams_store.types";
import { useMemo } from "react";
import ticketTemplateApi from "@/api/ticket_template";
import { addToast } from "../toast";
import ticketApi from "@/api/ticket";
import { useRouter } from "next/router";

const messageBuble: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
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
            Чатаас тикет үүсгэх
          </EuiContextMenuItem>
        </EuiContextMenuPanel>
      </EuiPopover>
    </div>
  );
};

const TicketCreationForm = ({ id, onCancelClick, description }) => {
  const router = useRouter();
  const basicSelectId = useGeneratedHtmlId({ prefix: "basicSelect" });
  const [ticketType, setTicketType] = useState(null);
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState(description ? description : "");
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [titleError, setTitleError] = useState<string | undefined>(undefined);
  const [typeError, setTypeError] = useState<string | undefined>(undefined);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const {
    data: compactList,
    error,
    isLoading,
    mutate: loadCompactList,
  } = useSWR("/crm/ticket/", async (path) => {
    try {
      const response = await ticketTemplateApi.getCompactList(true);
      const result = response.data.results.map((item) => {
        if (ticketType == null) setTicketType(item.id);
        return {
          text: item.name,
          value: item.id,
        };
      });
      return result;
    } catch (e) {
      console.error(e);
    }
  });
  const { data: teamsList } = useTeams<Teams[]>();

  const teamsSelectionOptions = useMemo(() => {
    if (!teamsList) {
      return [];
    }
    return teamsList.map((team) => ({
      value: team.id,
      text: team.name,
    }));
  }, [teamsList]);

  const onSubmit = async (data) => {
    if (!ticketTitle.trim()) {
      setTitleError("Нэр хоосон байж болохгүй.");
      if (!ticketType) {
        setTypeError("Төрөл хоосон байж болохгүй.");
      }
      return;
    }

    try {
      let payload = {
        title: ticketTitle,
        body: ticketDescription,
        at_team_id: selectedTeamId,
      };
      const response = await ticketApi.create(ticketType, payload);
      if (response.status == 201) {
        addToast({
          id: "success",
          title: "Үүслээ",
          color: "success",
        });
        if (response.data) {
          router.push(`/dashboards/crm/ticket/${response?.data?.id}`);
        } else {
          router.push("/dashboards/crm/ticket?pageIndex=1&pageSize=10");
        }
      } else {
        addToast({
          id: "error",
          title: "Алдаа гарлаа",
          color: "warning",
        });
      }
    } catch (e) {
      addToast({
        id: "error-danger",
        title: "ERROR",
        color: "danger",
      });
    }
    return false;
  };

  const onTeamChange = (e) => {
    setSelectedTeamId(e.target.value);
  };

  const handleClick = () => {
    onCancelClick();
  };

  return (
    <EuiForm id={id} component="form" onSubmit={handleSubmit(onSubmit)}>
      <EuiFormRow label="Төрөл" isInvalid={!!typeError} error={typeError}>
        <EuiSelect
          isInvalid={!!typeError}
          id={basicSelectId}
          hasNoInitialSelection
          value={ticketType}
          onChange={(e) => setTicketType(e.target.value)}
          options={compactList}
        />
      </EuiFormRow>

      <EuiFormRow label="Тикетийн нэр" isInvalid={!!titleError} error={titleError}>
        <EuiFieldText
          isInvalid={!!titleError}
          name="first"
          value={ticketTitle}
          onChange={(e) => setTicketTitle(e.target.value)}
          placeholder="Нэр"
        />
      </EuiFormRow>

      <EuiFormRow label="Тайлбар">
        <EuiTextArea
          placeholder="Текст"
          aria-label="Use aria labels when no actual label is in use"
          value={ticketDescription}
          onChange={(e) => setTicketDescription(e.target.value)}
        />
      </EuiFormRow>

      <EuiFormRow label="Хариуцах нэгж">
        <EuiSelect
          hasNoInitialSelection
          fullWidth={true}
          options={teamsSelectionOptions}
          value={selectedTeamId}
          onChange={(e) => onTeamChange(e)}
          aria-label="Хариуцах нэгж"
        />
      </EuiFormRow>

      <EuiSpacer />
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiFlexItem>
          <EuiButtonEmpty onClick={handleClick}>Болих</EuiButtonEmpty>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiButton type="submit" fill>
            Үүсгэх
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiForm>
  );
};

const ChatMessage = ({ id, name, fbProfile, isToMe = false, message, timestamp = "now" }) => {
  const formattedDate = moment(timestamp).format("YYYY-MM-DD HH:mm");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const closeModal = () => setIsModalVisible(false);
  const showModal = () => setIsModalVisible(true);

  const modalFormId = useGeneratedHtmlId({ prefix: "modalForm" });
  const modalTitleId = useGeneratedHtmlId();

  const cancelClickHandler = (dataFromChild) => {
    setIsModalVisible(false);
  };

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
      <EuiAvatar
        size="m"
        name={fbProfile?.first_name ? fbProfile?.first_name : "Noname"}
        imageUrl={fbProfile ? getImgUrl(fbProfile.picture) : undefined}
      />
      <div style={messageBuble}>
        <p>{extractMessage(message)}</p>
        <span css={styles.messageTimestamp}>{formattedDate}</span>
        {isToMe ? (
          <EuiFlexGroup justifyContent="flexStart">
            <EuiFlexItem grow={true}>
              <EuiButtonEmpty size="s" onClick={showModal} iconType="plusInCircle">
                Тикет үүсгэх
              </EuiButtonEmpty>
            </EuiFlexItem>
          </EuiFlexGroup>
        ) : null}
      </div>
      {isModalVisible && (
        <EuiModal
          aria-labelledby={modalTitleId}
          onClose={closeModal}
          initialFocus="[name=popswitch]"
        >
          <EuiModalHeader>
            <EuiModalHeaderTitle id={modalTitleId}>Тикет үүсгэх</EuiModalHeaderTitle>
          </EuiModalHeader>

          <EuiModalBody>
            <TicketCreationForm
              id={modalFormId}
              onCancelClick={cancelClickHandler}
              description={extractMessage(message)}
            />
          </EuiModalBody>
        </EuiModal>
      )}
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
