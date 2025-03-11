import {
  EuiButton,
  EuiCallOut,
  EuiConfirmModal,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiPopover,
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
import useCreateSegmentRetarget from "@/hooks/useCreateSegmentRetarget";
import { addToast } from "../toast";
import useGetCampaignSuccessErrorCount from "@/hooks/useGetCampaignCount";

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
  const router = useRouter();

  const { data } = useCampaignContext();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [chosenSegmentType, setChosenSegmentType] = useState(null);
  const [isRetargetPopoverOpen, setRetargetPopover] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const {
    data: retargetRes,
    isMutating: isCreateSegmentRetargetMutating,
    trigger: createSegmentRetarget,
  } = useCreateSegmentRetarget();

  const { trigger: rejectTrigger, isMutating: rejectIsLoading } = useUpdateRejectTemplate(data?.id);
  const { trigger: doneTrigger, isMutating: doneIsMutating } = useUpdateDoneTemplate(data?.id);
  const { trigger: stopTrigger, isMutating: stopIsMutating } = useUpdateStopTemplate(data?.id);
  const { trigger: approveTrigger, isMutating: approveIsMutating } = useUpdateApproveTemplate(
    data?.id,
  );
  const { data: countData } = useGetCampaignSuccessErrorCount(data?.id?.toString());

  const customContextMenuPopoverId = useGeneratedHtmlId({
    prefix: "customContextMenuPopover",
  });

  const onRetargetButtonClick = () => {
    if (data.kind === "sms") return;
    setRetargetPopover(!isRetargetPopoverOpen);
  };
  const closeRetargetPopover = () => {
    setRetargetPopover(false);
  };
  const showConfirm = (type: string) => {
    setChosenSegmentType(type);
    setIsConfirmOpen(true);
  };

  const retargetButton = (
    <EuiButton
      iconType="arrowDown"
      iconSide="right"
      onClick={onRetargetButtonClick}
      disabled={data?.kind === "sms"}
    >
      Ретаргет
    </EuiButton>
  );

  const segmentTypes = Object.freeze({
    opened: "Нээсэн",
    not_opened: "Нээгээгүй",
    clicked: "Линк дарсан",
    not_clicked: "Линк дараагүй",
  });

  const createSegment = async (e) => {
    e.preventDefault();
    const templateId = data?.id;
    try {
      await createSegmentRetarget({
        template_id: templateId,
        retarget_type: chosenSegmentType,
      });
      if (retargetRes) {
        router.push(`/dashboards/cdp/segments/info/${retargetRes.id}`);
      } else {
        router.push("/dashboards/cdp/segments");
      }
    } catch (error) {
      addToast({
        id: "create-retager-error",
        color: "danger",
        title: "Алдаа",
        text: error,
      });
    }
  };

  const isMutating = doneIsMutating || approveIsMutating || rejectIsLoading || stopIsMutating;
  const isDraft = data?.status === "DRAFT";
  const isDone = data?.status === "DONE";
  const isErrored = data?.status === "ERROR";
  const isStopable =
    data?.status === "RECURRING" || data?.status === "SENDING" || data?.status === "SCHEDULED";
  const isRetargetable =
    data?.status != "DRAFT" &&
    data?.status != "DONE" &&
    data?.status != "APPROVED";

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

        {isRetargetable && (
          <EuiPopover
            id={customContextMenuPopoverId}
            button={retargetButton}
            isOpen={isRetargetPopoverOpen}
            closePopover={closeRetargetPopover}
            panelPaddingSize="none"
            anchorPosition="downLeft"
          >
            <EuiContextMenuPanel>
              <EuiContextMenuItem
                key="item-1"
                icon="indexOpen"
                size="s"
                onClick={() => showConfirm("opened")}
                disabled={data?.kind != "email"}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Нээсэн</span>
                  <span>(~{countData?.opened_count})</span>
                </div>
              </EuiContextMenuItem>
              <EuiContextMenuItem
                key="item-2"
                icon="indexOpen"
                size="s"
                onClick={() => showConfirm("not_opened")}
                disabled={data?.kind != "email"}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between", minWidth: "200px" }}
                >
                  <span>Нээгээгүй</span>
                  <span>(~{countData?.total_sent_count - countData?.opened_count})</span>
                </div>
              </EuiContextMenuItem>
              <EuiContextMenuItem
                key="item-3"
                icon="indexOpen"
                size="s"
                onClick={() => showConfirm("clicked")}
                disabled={data?.kind != "email"}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Линк дарсан</span>
                  <span>(~{countData?.clicked_count})</span>
                </div>
              </EuiContextMenuItem>
              <EuiContextMenuItem
                key="item-4"
                icon="indexOpen"
                size="s"
                onClick={() => showConfirm("not_clicked")}
                disabled={data?.kind != "email"}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Линк дараагүй</span>
                  <span>(~{countData?.total_sent_count - countData?.clicked_count})</span>
                </div>
              </EuiContextMenuItem>
            </EuiContextMenuPanel>
          </EuiPopover>
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
          confirmButtonText="Илгээх"
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
            байна. Та тухайн үйлдлийг хийхдээ итгэлтэй байна уу?
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

      {isConfirmOpen && (
        <EuiConfirmModal
          style={{ width: 600 }}
          title={`Ретаргет`}
          onCancel={() => {
            setIsConfirmOpen(false);
          }}
          onConfirm={createSegment}
          cancelButtonText="Болих"
          confirmButtonText="Сегмент үүсгэх"
          defaultFocusedButton="confirm"
          confirmButtonDisabled={isCreateSegmentRetargetMutating}
          isLoading={isCreateSegmentRetargetMutating}
        >
          <p>
            Та <b>{segmentTypes[chosenSegmentType]}</b> харилцагчдаар сегмент үүсгэх гэж байна. Та
            итгэлтэй байна уу?
          </p>
        </EuiConfirmModal>
      )}
    </>
  );
};

export default CampaignInfoActions;
