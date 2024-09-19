import {
  EuiButton,
  EuiCallOut,
  EuiConfirmModal,
  EuiSpacer,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { useRouter } from "next/router";
import { useState } from "react";
import useUpdateApproveTemplate from "../../hooks/useUpdateApproveTemplate";
import useUpdateDoneTemplate from "../../hooks/useUpdateDoneTemplate";
import { useCampaignContext } from "../../store/campaign_store";
import { globalMutate } from "../../utils/globalMutate";
import AdminManagerComponent from "../admin_manager_component";

const CampaignInfoActions = () => {
  const router = useRouter();
  const modalTitleId = useGeneratedHtmlId();

  const { data } = useCampaignContext();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const { trigger: doneTrigger, isMutating: doneIsMutating } = useUpdateDoneTemplate(
    router.query.id,
  );
  const { trigger: approveTrigger, isMutating: approveIsMutating } = useUpdateApproveTemplate(
    router.query.id,
  );

  const isMutating = doneIsMutating || approveIsMutating;

  const closeModal = () => setIsModalVisible(false);
  const showModal = () => setIsModalVisible(true);

  const handleDoneTrigger = async () => {
    try {
      const response = await doneTrigger();
      if (response) {
        closeModal();
        globalMutate("/api/v1/dj/templates/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleApproveTrigger = async () => {
    try {
      const response = await approveTrigger();
      if (response) {
        closeModal();
        globalMutate("/api/v1/dj/templates/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {data?.status === "DRAFT" && (
        <EuiButton
          isLoading={isMutating}
          color="success"
          onClick={showModal}
          fill
          key="Create-segment"
        >
          Done
        </EuiButton>
      )}
      {data?.status === "DONE" && (
        <AdminManagerComponent>
          <EuiButton
            isLoading={isMutating}
            color="primary"
            onClick={showModal}
            fill
            key="Approve-segment"
          >
            Approve
          </EuiButton>
        </AdminManagerComponent>
      )}
      {isModalVisible && data.status === "DRAFT" && (
        <EuiConfirmModal
          aria-labelledby={modalTitleId}
          style={{ width: 600 }}
          title="Update campaign"
          onCancel={closeModal}
          onConfirm={handleDoneTrigger}
          confirmButtonDisabled={data?.aud_count === 0}
          cancelButtonText="Cancel"
          confirmButtonText="Confirm"
          defaultFocusedButton={data?.aud_count === 0 ? "cancel" : "confirm"}
        >
          <EuiCallOut title="Warning" color="warning" iconType="warning">
            <p>Audience must be added to the campaign before marking it as done.</p>
          </EuiCallOut>
          <EuiSpacer />
          <p>
            The campaign will be marked as done, and it has reached an audience of{" "}
            <strong>{data?.aud_count}</strong>. Are you sure you want to continue?
          </p>
        </EuiConfirmModal>
      )}
      {isModalVisible && data.status === "DONE" && (
        <EuiConfirmModal
          aria-labelledby={modalTitleId}
          style={{ width: 600 }}
          title="Update campaign"
          onCancel={closeModal}
          onConfirm={handleApproveTrigger}
          cancelButtonText="Cancel"
          confirmButtonText="Confirm"
          defaultFocusedButton="confirm"
        >
          <p>
            The campaign will be marked as approved, and it has reached an audience of{" "}
            <strong>{data?.aud_count}</strong>. Are you sure you want to continue?
          </p>
        </EuiConfirmModal>
      )}
    </div>
  );
};

export default CampaignInfoActions;
