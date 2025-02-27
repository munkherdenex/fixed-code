import {
  EuiButton,
  EuiCallOut,
  EuiConfirmModal,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
  EuiToolTip,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { useTranslations } from "next-intl";
import { SetStateAction, useState } from "react";
import useUpdateApproveTemplate from "../../hooks/useUpdateApproveTemplate";
import useUpdateDoneTemplate from "../../hooks/useUpdateDoneTemplate";
import useUpdateRejectTemplate from "../../hooks/useUpdateRejectTemplate";
import useUpdateStopTemplate from "../../hooks/useUpdateStopTemplate";
import { useCampaignContext } from "../../store/campaign_store";
import { globalMutate } from "../../utils/globalMutate";
import AdminManagerComponent from "../admin_manager_component";
import { useRouter } from "next/router";
import useDeleteTemplate from "../../hooks/useDeleteTemplate";

const DeleteConfirmModal = ({
  setIsModalVisible,
}: {
  setIsModalVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const modalTitleId = useGeneratedHtmlId();
  const translate = useTranslations();

  const { trigger, isMutating } = useDeleteTemplate(router.query.id);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");

  const closeModal = async () => {
    setIsModalVisible(false);
  };

  const confirmModal = async () => {
    await router.replace("/dashboards/cdp/campaign");
    try {
      await trigger();
    } catch (error) {
      console.error(error);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeleteConfirmValue(e.target.value);
  };

  return (
    <EuiConfirmModal
      aria-labelledby={modalTitleId}
      title="Устгах"
      onCancel={closeModal}
      onConfirm={() => {
        confirmModal();
      }}
      confirmButtonText={translate("confirm")}
      cancelButtonText={translate("cancel")}
      buttonColor="danger"
      isLoading={isMutating}
      confirmButtonDisabled={deleteConfirmValue.toLowerCase() !== "delete"}
    >
      <EuiCallOut title="Анхааруулга" color="warning" iconType="warning">
        <p>{translate("delete_campaign_warning")}</p>
      </EuiCallOut>
      <EuiSpacer />
      <EuiFormRow label={translate("type_the_word_delete_confirm")}>
        <EuiFieldText
          isLoading={isMutating}
          name="delete"
          value={deleteConfirmValue}
          onChange={onChange}
        />
      </EuiFormRow>
    </EuiConfirmModal>
  );
};

const CampaignInfoActions = () => {
  const modalTitleId = useGeneratedHtmlId();
  const translate = useTranslations();

  const { data } = useCampaignContext();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
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
  const isErrored = data?.status === "ERROR";
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
        {(isDraft || isErrored) && (
          <EuiFlexItem grow={false}>
            <EuiFlexGroup responsive={false} gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiButton
                  iconType="trash"
                  aria-label="Устгах"
                  color="danger"
                  onClick={() => setIsDeleteModalVisible(true)}
                >
                  {translate("delete")}
                </EuiButton>
              </EuiFlexItem>
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
            </EuiFlexGroup>
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
          title="Батлуулах"
          onCancel={closeModal}
          onConfirm={handleDoneTrigger}
          confirmButtonDisabled={data?.aud_count === 0 && !data?.is_to_all}
          cancelButtonText="Болих"
          isLoading={isMutating}
          confirmButtonText="Илгээе"
          defaultFocusedButton={data?.is_to_all || data?.aud_count === 0 ? "cancel" : "confirm"}
        >
          {!data?.is_to_all && data?.aud_count === 0 && (
            <EuiCallOut title="Анхааруулга" color="warning" iconType="warning">
              <p>
                Мэдэгдэл илгээхэд заавал харилцагчийн мэдээлэл оруулах шаардлагатай тул харилцагч
                нэмнэ үү..
              </p>
            </EuiCallOut>
          )}
          <EuiSpacer />
          {(data?.is_to_all || data?.aud_count > 0) && (
            <p>
              Менежер баталсны дараа энэ мэдэгдэл{" "}
              <strong>{data?.is_to_all ? "бүх" : data?.aud_count}</strong> хэрэглэгчрүү илгээгдэх.
              Та менежерээр батлуулахаар илгээх үү?
            </p>
          )}
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
          cancelButtonText="Болих"
          confirmButtonText="Илгээх"
          defaultFocusedButton="confirm"
        >
          <p>
            Мэдэгдэл илгээх <strong>{data?.aud_count}</strong> харилцагчид мэдэгдэл илгээх гэж
            байна. Та тухайн үйлдлийг хийхдээ итгэлтэй байна уу.
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
      {isDeleteModalVisible && isDraft && (
        <DeleteConfirmModal setIsModalVisible={setIsDeleteModalVisible} />
      )}
    </>
  );
};

export default CampaignInfoActions;
