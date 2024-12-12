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
  const translate = useTranslations();
  const { customerDeleteTrigger, isMutating } = useDeleteCustomer(router.query.id);
  const [deleteMessage, setDeleteMessage] = useState("");

  return (
    <EuiConfirmModal
      title={translate("warning")}
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
          title: translate("success.title"),
          text: translate("success.customer-deleted"),
        });
      }}
      confirmButtonText={translate("delete")}
      cancelButtonText={translate("cancel")}
      buttonColor="danger"
    >
      <EuiFormRow label={translate("type-the-word-delete")}>
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
