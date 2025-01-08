import {
  EuiBadge,
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
  EuiTextColor,
  EuiToolTip,
  useGeneratedHtmlId,
} from "@elastic/eui";
import moment from "moment";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { SetStateAction, useState } from "react";
import useDeleteTemplate from "../../hooks/useDeleteTemplate";
import useGetCampaignSuccessErrorCount, {
  CampaignCountSuccessErrorResponse,
} from "../../hooks/useGetCampaignCount";
import { useCampaignContext } from "../../store/campaign_store";
import { badgeColor } from "../../utils/badge_color";
import { getCampaignIcon, getDataKind } from "../../utils/helper";
import ReccurenceRuleLayout from "./reccurence_rule_layout";

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
      title="Delete campaign?"
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
      <EuiCallOut title="Proceed with caution!" color="warning" iconType="warning">
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

const CampaignGeneralDetails = () => {
  const translate = useTranslations();
  const { data } = useCampaignContext();
  const { data: countData } = useGetCampaignSuccessErrorCount<CampaignCountSuccessErrorResponse>(
    data?.id?.toString(),
  );

  const [isModalVisible, setIsModalVisible] = useState(false);

  //INFO: This is a workaround to get the kind of the template becaouse of POCKET
  const dataKind = getDataKind(data);
  const iconType =
    data?.start_date && data?.is_recurring
      ? "timeRefresh"
      : data?.start_date && !data?.is_recurring
        ? "timeslider"
        : "pivot";

  return (
    <div>
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiPanel paddingSize="s" color="subdued">
            <EuiFlexGroup responsive={false} alignItems="center" justifyContent="spaceBetween">
              <EuiFlexItem grow={false}>
                <strong>{translate("campaign_details")}</strong>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup responsive={false} gutterSize="s">
                  {(data?.status === "DRAFT" || data?.status === "ERROR") && (
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
            <EuiFlexItem>
              <EuiStat title={data?.title} description={translate("title")} titleSize="xs" />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                title={
                  <EuiTextColor color="accent">
                    <span>
                      <EuiIcon aria-label="email" type={getCampaignIcon(dataKind)} color="accent" /> 
                      <EuiTextColor color={badgeColor(dataKind)}>{dataKind.toUpperCase()}</EuiTextColor>
                    </span>
                  </EuiTextColor>
                }
                description={translate("kind")}
                titleSize="xs"
                titleColor="subdued"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                title={
                  <div>
                    <EuiIcon type={iconType} color={badgeColor(data?.status)} />{" "}
                    <EuiBadge color={badgeColor(data?.status)}>{data?.status}</EuiBadge>
                  </div>
                }
                description={translate("status")}
                titleSize="xs"
                titleColor="primary"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                title={
                  <div>
                    {data?.created_by}
                    <br />
                    {moment(data?.created_at).format("YYYY-MM-DD LT")}
                  </div>
                }
                description={translate("created")}
                titleSize="xs"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                title={
                  <div>
                    {data?.updated_by}
                    <br />
                    {moment(data?.updated_at).format("YYYY-MM-DD LT")}
                  </div>
                }
                description={translate("updated")}
                titleSize="xs"
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiStat
                title={<span>{data?.description || "Empty description"}</span>}
                titleSize="xs"
                description={translate("description")}
                titleColor=""
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                title={
                  <EuiFlexGroup gutterSize="xs">
                    <EuiFlexItem>
                      <EuiTextColor>
                        <span>
                          {translate("audience")}: {data?.aud_count}
                        </span>
                      </EuiTextColor>{" "}
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiTextColor color="success">
                        <span>
                          {translate("success")}: {countData?.success_count}
                        </span>
                      </EuiTextColor>{" "}
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiTextColor color="danger">
                        <span>
                          {translate("error")}: {countData?.error_count}
                        </span>
                      </EuiTextColor>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                }
                description={translate("sent_result")}
                titleSize="xs"
                titleColor="primary"
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFlexGroup>
            <EuiPanel hasBorder={true}>
              <ReccurenceRuleLayout />
            </EuiPanel>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
      {isModalVisible && <DeleteConfirmModal setIsModalVisible={setIsModalVisible} />}
    </div>
  );
};

export default CampaignGeneralDetails;
