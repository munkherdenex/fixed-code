import { EuiConfirmModal, EuiFormRow, EuiFieldText } from "@elastic/eui";
import router from "next/router";
import { SetStateAction, useState } from "react";
import useDeleteCustomer from "../../hooks/useDeleteCustomer";
import { addToast } from "../toast";

const pathPrefix = process.env.PATH_PREFIX;

const DeleteCustomerModal = ({
  setIsModalVisible,
}: {
  setIsModalVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const { customerDeleteTrigger } = useDeleteCustomer(router.query.id);
  const [deleteMessage, setDeleteMessage] = useState("");

  return (
    <EuiConfirmModal
      title="Warning"
      onCancel={() => setIsModalVisible(false)}
      confirmButtonDisabled={deleteMessage.toLowerCase() !== "delete"}
      onConfirm={async () => {
        try {
          await customerDeleteTrigger();
          router.push(`${pathPrefix}/dashboards/audience`);
          addToast({
            id: "customer-deleted",
            color: "success",
            title: "Success",
            text: "Successfully deleted",
          });
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

export default DeleteCustomerModal;
