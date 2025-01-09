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
import { getCampaignIcon, getCampaignStatusIcon, getDataKind } from "../../utils/helper";
import ReccurenceRuleLayout from "./reccurence_rule_layout";

const CampaignGeneralDetails = () => {
  const translate = useTranslations();
  const { data } = useCampaignContext();
  const { data: countData } = useGetCampaignSuccessErrorCount<CampaignCountSuccessErrorResponse>(
    data?.id?.toString(),
  );

  //INFO: This is a workaround to get the kind of the template becaouse of POCKET
  const dataKind = getDataKind(data);
  const iconType = getCampaignStatusIcon(data?.start_date != null, data?.is_recurring);

  return (
    <div>
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiStat title={data?.title} description={translate("title")} titleSize="xs" />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                title={
                  <span>
                    <EuiIcon
                      aria-label={dataKind}
                      type={getCampaignIcon(dataKind)}
                      color={badgeColor(dataKind)}
                    />{" "}
                    <EuiTextColor color={badgeColor(dataKind)}>
                      {dataKind.toUpperCase()}
                    </EuiTextColor>
                  </span>
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
    </div>
  );
};

export default CampaignGeneralDetails;
