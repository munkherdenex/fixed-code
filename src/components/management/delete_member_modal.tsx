import { EuiConfirmModal, EuiFormRow, EuiFieldText } from "@elastic/eui";
import { SetStateAction, useState } from "react";
import { addToast } from "../toast";
import useDeleteMember from "../../hooks/useDeleteMember";
import useGetCurrentTeamMembers from "../../hooks/useCurrentTeamMembers";
import { globalMutate } from "../../utils/globalMutate";

const DeleteMemberModal = ({
  selectMember,
  setIsModalVisible,
}: {
  selectMember: string;
  setIsModalVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const { mutate } = useGetCurrentTeamMembers();
  const { trigger } = useDeleteMember(selectMember);
  const [deleteMessage, setDeleteMessage] = useState("");

  return (
    <EuiConfirmModal
      title="Warning"
      onCancel={() => setIsModalVisible(false)}
      confirmButtonDisabled={deleteMessage.toLowerCase() !== "delete"}
      onConfirm={async () => {
        try {
          const response = await trigger();
          if (response) {
            addToast({
              id: "member-deleted",
              color: "success",
              title: "Success",
              text: "Successfully deleted",
            });
            setIsModalVisible(false);
            mutate();
            globalMutate("/api/v1/teams");
          }
        } catch (error) {
          console.error("ERROR:: ", error);
        }
      }}
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
