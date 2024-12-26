import { useRouter } from "next/router";
import useDeleteSegmentAudience from "../../hooks/useDeleteSegmentAudience";
import { addToast } from "../toast";
import { EuiButtonIcon, EuiConfirmModal, EuiFieldText, EuiFormRow } from "@elastic/eui";
import { globalMutate } from "../../utils/globalMutate";
import { useState } from "react";
import { useTranslations } from "next-intl";

const DeleteSegmentAudience = ({ audience_id }: { audience_id: string | number | string[] }) => {
  const translate = useTranslations();
  const router = useRouter();
  const { id } = router.query;
  const { trigger, isMutating } = useDeleteSegmentAudience(id, audience_id);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  const deleteSegmentAudience = async () => {
    try {
      await trigger();
    } catch (e) {
      console.error(e);
    }
    setIsModalVisible(false);
    addToast({
      id: "segment-audience-success",
      color: "success",
      title: "Success",
      text: "Successfully deleted",
    });
    globalMutate(`/api/v1/dj/segments/${id}/customers/`);
  };

  return (
    <>
      <EuiButtonIcon
        display="base"
        iconType="trash"
        aria-label="Delete"
        color="danger"
        onClick={() => setIsModalVisible(true)}
      />

      {isModalVisible && (
        <EuiConfirmModal
          title="Warning"
          onCancel={() => setIsModalVisible(false)}
          isLoading={isMutating}
          confirmButtonDisabled={deleteMessage.toLowerCase() !== "delete"}
          onConfirm={async () => {
            deleteSegmentAudience();
          }}
          confirmButtonText="Delete"
          cancelButtonText="Cancel"
          buttonColor="danger"
        >
          <EuiFormRow label={translate("type_the_word_delete_confirm")}>
            <EuiFieldText
              name="delete"
              value={deleteMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setDeleteMessage(e.target.value);
              }}
            />
          </EuiFormRow>
        </EuiConfirmModal>
      )}
    </>
  );
};

export default DeleteSegmentAudience;
