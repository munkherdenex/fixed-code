import { EuiConfirmModal, EuiFieldText, EuiFormRow } from "@elastic/eui";
import { SetStateAction, useState } from "react";
import useDeleteMember from "../../hooks/useDeleteMember";
import { useManagementTeamsContext } from "../../store/management_teams_store";
import { globalMutate } from "../../utils/globalMutate";
import { addToast } from "../toast";

const DeleteMemberModal = ({
  selectMember,
  setIsModalVisible,
}: {
  selectMember: string;
  setIsModalVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const { currentTeam } = useManagementTeamsContext();
  const { trigger } = useDeleteMember(selectMember);
  const [deleteMessage, setDeleteMessage] = useState("");

  const deleteMember = async () => {
    try {
      await trigger();
    } catch (error) {
      console.error("ERROR:: ", error);
    }
    addToast({
      id: "member-deleted",
      color: "success",
      title: "Success",
      text: "Successfully deleted",
    });
    setIsModalVisible(false);
    globalMutate(`/api/v1/teams/${currentTeam?.id}/?members=true`);
  };

  return (
    <EuiConfirmModal
      title="Warning"
      onCancel={() => setIsModalVisible(false)}
      confirmButtonDisabled={deleteMessage.toLowerCase() !== "delete"}
      onConfirm={deleteMember}
      confirmButtonText="Delete"
      cancelButtonText="Cancel"
      buttonColor="danger"
    >
      <EuiFormRow label="Type the word 'delete' to confirm">
        <EuiFieldText
          name="delete"
          value={deleteMessage}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setDeleteMessage(e.target.value);
          }}
        />
      </EuiFormRow>
    </EuiConfirmModal>
  );
};

export default DeleteMemberModal;
