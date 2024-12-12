import {
  EuiButton,
  EuiCallOut,
  EuiConfirmModal,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { useTranslations } from "next-intl";
import { useState } from "react";
import useUpdateApproveTemplate from "../../hooks/useUpdateApproveTemplate";
import useUpdateDoneTemplate from "../../hooks/useUpdateDoneTemplate";
import useUpdateRejectTemplate from "../../hooks/useUpdateRejectTemplate";
import useUpdateStopTemplate from "../../hooks/useUpdateStopTemplate";
import { useCampaignContext } from "../../store/campaign_store";
import { globalMutate } from "../../utils/globalMutate";
import AdminManagerComponent from "../admin_manager_component";

const CampaignInfoActions = () => {
  const modalTitleId = useGeneratedHtmlId();
  const translate = useTranslations();

  const { data } = useCampaignContext();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);

  const { trigger: rejectTrigger, isMutating: rejectIsLoading } = useUpdateRejectTemplate(data?.id);
  const { trigger: doneTrigger, isMutating: doneIsMutating } = useUpdateDoneTemplate(data?.id);
  const { trigger: stopTrigger, isMutating: stopIsMutating } = useUpdateStopTemplate(data?.id);
  const { trigger: approveTrigger, isMutating: approveIsMutating } = useUpdateApproveTemplate(
    data?.id,
  );

  const isMutating = doneIsMutating || approveIsMutating || rejectIsLoading || stopIsMutating;
  const isDraft = data?.status === "DRAFT";
  const isDone = data?.status === "DONE";
  const isStopable =
    data?.status === "RECURRING" || data?.status === "SENDING" || data?.status === "SCHEDULED";

  const closeModal = () => setIsModalVisible(false);
  const showModal = () => setIsModalVisible(true);

  const handleRejectTrigger = async () => {
    try {
      const response = await rejectTrigger();
      if (response) {
        closeModal();
        globalMutate("/api/v1/dj/templates/");
      }
    } catch (error) {
      console.error(error);
    }
  };

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

  const handleStopTrigger = async () => {
    try {
      const response = await stopTrigger();
      if (response) {
        closeModal();
        globalMutate("/api/v1/dj/templates/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <EuiFlexGroup>
        {isDraft && (
          <EuiFlexItem>
            <EuiButton
              isLoading={isMutating}
              color="success"
              onClick={showModal}
              fill
              key="Create-segment"
            >
              {translate("done")}
            </EuiButton>
          </EuiFlexItem>
        )}
        {isDone && (
          <EuiFlexItem>
            <AdminManagerComponent>
              <EuiButton
                isLoading={isMutating}
                color="danger"
                onClick={() => setIsRejectModalVisible(true)}
                fill
                key="Approve-segment"
              >
                {translate("reject")}
              </EuiButton>
            </AdminManagerComponent>
          </EuiFlexItem>
        )}
        {isDone && (
          <EuiFlexItem>
            <AdminManagerComponent>
              <EuiButton
                isLoading={isMutating}
                color="primary"
                onClick={showModal}
                fill
                key="Approve-segment"
              >
                {translate("approve")}
              </EuiButton>
            </AdminManagerComponent>
          </EuiFlexItem>
        )}
        {isStopable && (
          <EuiFlexItem>
            <AdminManagerComponent>
              <EuiButton
                isLoading={isMutating}
                color="primary"
                onClick={showModal}
                fill
                key="stop-segment"
              >
                {translate("stop")}
              </EuiButton>
            </AdminManagerComponent>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
      {isModalVisible && isDraft && (
        <EuiConfirmModal
          aria-labelledby={modalTitleId}
          style={{ width: 600 }}
          title="Update campaign"
          onCancel={closeModal}
          onConfirm={handleDoneTrigger}
          confirmButtonDisabled={data?.aud_count === 0}
          cancelButtonText="Cancel"
          isLoading={isMutating}
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
      {isRejectModalVisible && isDone && (
        <EuiConfirmModal
          aria-labelledby={modalTitleId}
          style={{ width: 600 }}
          onCancel={() => setIsRejectModalVisible(false)}
          onConfirm={handleRejectTrigger}
          title="Update campaign"
          buttonColor="danger"
          isLoading={isMutating}
          cancelButtonText="Cancel"
          confirmButtonText="Reject"
          defaultFocusedButton="confirm"
        >
          <EuiCallOut title="Warning" color="warning" iconType="warning">
            <p>This campaign will be rejected</p>
          </EuiCallOut>
          <EuiSpacer />
          <p>The campaign will be marked as DRAFT.</p>
        </EuiConfirmModal>
      )}
      {isModalVisible && isDone && (
        <EuiConfirmModal
          aria-labelledby={modalTitleId}
          style={{ width: 600 }}
          title="Update campaign"
          onCancel={closeModal}
          onConfirm={handleApproveTrigger}
          isLoading={isMutating}
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
      {isModalVisible && isStopable && (
        <EuiConfirmModal
          aria-labelledby={modalTitleId}
          style={{ width: 600 }}
          title="Stop campaign"
          onCancel={closeModal}
          onConfirm={handleStopTrigger}
          isLoading={isMutating}
          cancelButtonText="Cancel"
          confirmButtonText="Confirm"
          defaultFocusedButton="confirm"
        />
      )}
    </>
  );
};

export default CampaignInfoActions;
