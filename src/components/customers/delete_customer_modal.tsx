import { EuiConfirmModal, EuiFormRow, EuiFieldText } from "@elastic/eui";
import router from "next/router";
import { SetStateAction, useState } from "react";
import useDeleteCustomer from "../../hooks/useDeleteCustomer";
import { addToast } from "../toast";
import { useTranslations } from "next-intl";

const pathPrefix = process.env.PATH_PREFIX;

const DeleteCustomerModal = ({
  setIsModalVisible,
}: {
  setIsModalVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const audienceT = useTranslations();
  const { customerDeleteTrigger, isMutating } = useDeleteCustomer(router.query.id);
  const [deleteMessage, setDeleteMessage] = useState("");

  return (
    <EuiConfirmModal
      title={audienceT("warning")}
      isLoading={isMutating}
      onCancel={() => setIsModalVisible(false)}
      confirmButtonDisabled={deleteMessage.toLowerCase() !== "delete"}
      onConfirm={async () => {
        router.replace(`${pathPrefix}/dashboards/cdp/audience`);
        try {
          await customerDeleteTrigger();
        } catch (error) {
          console.error("ERROR:: ", error);
        }
        addToast({
          id: "customer-deleted",
          color: "success",
          title: audienceT("success.title"),
          text: audienceT("success.customer-deleted"),
        });
      }}
      confirmButtonText="Delete"
      cancelButtonText="Cancel"
      buttonColor="danger"
    >
      <EuiFormRow label={audienceT("type-the-word-delete")}>
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
