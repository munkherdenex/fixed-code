import { useRouter } from "next/router";
import useDeleteSegmentAudience from "../../hooks/useDeleteSegmentAudience";
import { addToast } from "../toast";
import { EuiButtonIcon, EuiConfirmModal, EuiFieldText, EuiFormRow } from "@elastic/eui";
import { globalMutate } from "../../utils/globalMutate";
import { useState } from "react";

const DeleteSegmentAudience = ({
    audience_id,
}: {
    audience_id: string | number | string[];
}) => {
    const router = useRouter();
    const { id } = router.query;
    const { trigger } = useDeleteSegmentAudience(id, audience_id);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState("");
    const deleteSegmentAudience = async () => {
        try {
            const response = await trigger();
            if (response) {
                setIsModalVisible(false)
                addToast({
                    id: "segment-audience-success",
                    color: "success",
                    title: "Success",
                    text: "Successfully deleted",
                });
                globalMutate(`/api/v1/dj/segments/${id}/customers/`);
            }
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <>
            <EuiButtonIcon
                display="base"
                iconType="trash"
                aria-label="Delete"
                color="danger"
                onClick={() => setIsModalVisible(true)}
            />

            {
                isModalVisible && (
                    <EuiConfirmModal
                        title="Warning"
                        onCancel={() => setIsModalVisible(false)}
                        confirmButtonDisabled={deleteMessage.toLowerCase() !== "delete"}
                        onConfirm={async () => {
                            deleteSegmentAudience();
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
                )
            }

        </>
    );
};

export default DeleteSegmentAudience;
