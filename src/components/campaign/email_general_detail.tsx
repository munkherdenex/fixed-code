import {
  EuiButtonIcon,
  EuiCallOut,
  EuiConfirmModal,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiStat,
  EuiPanel,
  EuiSpacer,
  useGeneratedHtmlId,
  EuiTextColor,
  EuiIcon,
  EuiToolTip,
} from "@elastic/eui";
import { jsonrepair } from "jsonrepair";
import moment from "moment";
import { useRouter } from "next/router";
import { SetStateAction, useState } from "react";
import { IS_POCKET } from "../../constants";
import useDeleteTemplate from "../../hooks/useDeleteTemplate";
import useGetTemplates, { Template } from "../../hooks/useGetTemplates";
import EditTemplateFlyout from "./edit_template_flyout";

const DeleteConfirmModal = ({
  setIsModalVisible,
}: {
  setIsModalVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const modalTitleId = useGeneratedHtmlId();
  const { trigger, isMutating } = useDeleteTemplate(router.query.id);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");

  const closeModal = async () => {
    setIsModalVisible(false);
  };

  const confirmModal = async () => {
    const response = await trigger();
    if (response) {
      await router.replace("/dashboards/campaign");
      setIsModalVisible(false);
      setDeleteConfirmValue("");
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeleteConfirmValue(e.target.value);
  };

  return (
    <EuiConfirmModal
      aria-labelledby={modalTitleId}
      title="Delete campaign?"
      onCancel={closeModal}
      onConfirm={() => {
        confirmModal();
      }}
      confirmButtonText="Delete"
      cancelButtonText="Cancel"
      buttonColor="danger"
      isLoading={isMutating}
      confirmButtonDisabled={deleteConfirmValue.toLowerCase() !== "delete"}
    >
      <EuiCallOut title="Proceed with caution!" color="warning" iconType="warning">
        <p>
          You are about to delete this campaign. This is a destructive action and cannot be undone.
          Are you sure you want to proceed?
        </p>
      </EuiCallOut>
      <EuiSpacer />
      <EuiFormRow label="Type the word 'delete' to confirm">
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

const EmailGeneralDetails = ({
  templateStatus,
}: {
  templateStatus?: "DRAFT" | "APPROVED" | "PUBLISHED" | "DONE" | "ERROR";
}) => {
  const router = useRouter();

  const { data, isLoading } = useGetTemplates<Template>(
    router.query.id,
    {},
    {
      refreshInterval: templateStatus !== "DRAFT" ? 1000 : 0,
    },
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditFlyoutVisible, setIsEditFlyoutVisible] = useState(false);

  const dataKind =
    IS_POCKET && data?.kind === "api"
      ? JSON.parse(jsonrepair(data?.body) || "{}").type
        ? JSON.parse(jsonrepair(data?.body) || "{}").type
        : data?.kind
      : data?.kind;

  const closeFlyout = () => {
    setIsEditFlyoutVisible(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  return (
    <div>
      <EuiPanel>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <EuiPanel paddingSize="s" color="subdued">
              <EuiFlexGroup responsive={false} alignItems="center" justifyContent="spaceBetween">
                <EuiFlexItem grow={false}>
                  <strong>Campaign info details</strong>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiFlexGroup responsive={false} gutterSize="s">
                    {data.status !== "APPROVED" && data.status !== "PUBLISHED" && (
                      <EuiFlexItem grow={false}>
                        <EuiToolTip position="top" content="Delete">
                          <EuiButtonIcon
                            display="base"
                            iconType="trash"
                            aria-label="Delete"
                            color="danger"
                            onClick={() => setIsModalVisible(true)}
                          />
                        </EuiToolTip>
                      </EuiFlexItem>
                    )}
                  </EuiFlexGroup>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiPanel hasBorder={true}>
                <EuiFlexItem>
                  <EuiStat
                    title={data.title}
                    description={
                      <EuiTextColor color="default">
                        <span>Subject</span>
                      </EuiTextColor>
                    }
                    titleSize="xs"
                  />
                </EuiFlexItem>
              </EuiPanel>
              <EuiPanel hasBorder={true}>
                <EuiFlexItem>
                  <EuiStat
                    title={
                      <EuiTextColor color="accent">
                        <span>
                          <EuiIcon type="email" color="accent" /> {dataKind}
                        </span>
                      </EuiTextColor>
                    }
                    description="Kind"
                    titleSize="xs"
                    titleColor="subdued"
                  />
                </EuiFlexItem>
              </EuiPanel>
              <EuiPanel hasBorder={true}>
                <EuiFlexItem>
                  <EuiStat
                    title={
                      <EuiTextColor color="primary">
                        <span>{data?.status}</span>
                      </EuiTextColor>
                    }
                    description={
                      <EuiTextColor color="default">
                        <span>Status</span>
                      </EuiTextColor>
                    }
                    titleSize="xs"
                    titleColor="primary"
                  />
                </EuiFlexItem>
              </EuiPanel>
              <EuiPanel hasBorder={true}>
                <EuiFlexItem>
                  <EuiStat
                    title={moment(data?.created_at).format("YYYY-MM-DD LT")}
                    description={
                      <EuiTextColor color="subdued">
                        <span>
                          <EuiIcon type="tokenDate" /> Created date
                        </span>
                      </EuiTextColor>
                    }
                    titleColor=""
                    titleSize="xs"
                    titleElement="ss"
                  />
                </EuiFlexItem>
              </EuiPanel>
              <EuiPanel hasBorder={true}>
                <EuiFlexItem>
                  <EuiStat
                    title={moment(data?.updated_at).format("YYYY-MM-DD LT")}
                    titleSize="xs"
                    description={
                      <EuiTextColor color="subdued">
                        <span>
                          <EuiIcon type="tokenDate" color="accent" /> Updated date
                        </span>
                      </EuiTextColor>
                    }
                    titleColor=""
                  />
                </EuiFlexItem>
              </EuiPanel>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
      {isModalVisible && <DeleteConfirmModal setIsModalVisible={setIsModalVisible} />}
      {isEditFlyoutVisible && <EditTemplateFlyout closeFlyout={closeFlyout} data={data} />}
    </div>
  );
};

export default EmailGeneralDetails;
