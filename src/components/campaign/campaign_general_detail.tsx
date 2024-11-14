import {
  EuiButtonIcon,
  EuiCallOut,
  EuiConfirmModal,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiIcon,
  EuiPanel,
  EuiSpacer,
  EuiStat,
  EuiTextArea,
  EuiTextColor,
  EuiToolTip,
  useGeneratedHtmlId,
} from "@elastic/eui";
import moment from "moment";
import { useRouter } from "next/router";
import { SetStateAction, useState } from "react";
import useDeleteTemplate from "../../hooks/useDeleteTemplate";
import useGetCampaignSuccessErrorCount, {
  CampaignCountSuccessErrorResponse,
} from "../../hooks/useGetCampaignCount";
import { useCampaignContext } from "../../store/campaign_store";
import { getDataKind } from "../../utils/helper";
import ReccurenceRuleLayout from "./reccurence_rule_layout";

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
    await trigger();
    await router.replace("/dashboards/campaign");
    setIsModalVisible(false);
    setDeleteConfirmValue("");
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

const CampaignGeneralDetails = () => {
  const { data, isLoading } = useCampaignContext();
  const { data: countData } = useGetCampaignSuccessErrorCount<CampaignCountSuccessErrorResponse>(
    data?.id?.toString(),
  );

  const [isModalVisible, setIsModalVisible] = useState(false);

  //INFO: This is a workaround to get the kind of the template becaouse of POCKET
  const dataKind = getDataKind(data);

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
                    {data?.status === "DRAFT" ||
                      (data?.status === "ERROR" && (
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
                      ))}
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
                    title={data?.title}
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
                          <EuiIcon aria-label="email" type="email" color="accent" /> {dataKind}
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
                    title={
                      <EuiTextColor color="success">
                        <span>{countData?.success_count}</span>
                      </EuiTextColor>
                    }
                    description={
                      <EuiTextColor color="default">
                        <span>Success</span>
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
                    title={
                      <EuiTextColor color="red">
                        <span>{countData?.error_count}</span>
                      </EuiTextColor>
                    }
                    description={
                      <EuiTextColor color="default">
                        <span>Error</span>
                      </EuiTextColor>
                    }
                    titleSize="xs"
                    titleColor="primary"
                  />
                </EuiFlexItem>
              </EuiPanel>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGroup>
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
          <EuiFlexItem>
            <EuiPanel hasBorder={true}>
              <ReccurenceRuleLayout />
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFormRow label="Description" fullWidth>
              <>
                <EuiTextArea
                  aria-label="description"
                  readOnly
                  fullWidth
                  value={data?.description || "Empty description"}
                />
              </>
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
      {isModalVisible && <DeleteConfirmModal setIsModalVisible={setIsModalVisible} />}
    </div>
  );
};

export default CampaignGeneralDetails;
