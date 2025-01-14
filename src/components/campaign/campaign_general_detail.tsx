import {
  EuiBadge,
  EuiButton,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPanel,
  EuiPopover,
  EuiText,
  EuiTextColor,
  useGeneratedHtmlId,
} from "@elastic/eui";
import moment from "moment";
import { useTranslations } from "next-intl";
import useGetCampaignSuccessErrorCount from "../../hooks/useGetCampaignCount";
import { useCampaignContext } from "../../store/campaign_store";
import { badgeColor } from "../../utils/badge_color";
import { getCampaignIcon, getCampaignStatusIcon, getDataKind } from "../../utils/helper";
import ReccurenceRuleLayout from "./reccurence_rule_layout";
import { useState } from "react";

const CampaignGeneralDetails = () => {
  const translate = useTranslations();
  const { data } = useCampaignContext();
  const { data: countData } = useGetCampaignSuccessErrorCount(data?.id?.toString());

  //INFO: This is a workaround to get the kind of the template becaouse of POCKET
  const dataKind = getDataKind(data);
  const iconType = getCampaignStatusIcon(data?.start_date != null, data?.is_recurring);

  const [isRetargetPopoverOpen, setRetargetPopover] = useState(false);
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

  const retargetButton = (
    <EuiButton
      size="s"
      iconType="arrowDown"
      iconSide="right"
      onClick={onRetargetButtonClick}
      disabled={data.kind === "sms"}
    >
      Ретаргет
    </EuiButton>
  );

  return (
    <div>
      <EuiFlexGroup direction="column">
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiText>
              <h1>{data?.title}</h1>
            </EuiText>
            <EuiText>
              <EuiIcon
                aria-label={dataKind}
                type={getCampaignIcon(dataKind)}
                color={badgeColor(dataKind)}
              />{" "}
              <EuiTextColor color={badgeColor(dataKind)}>{dataKind?.toUpperCase()}</EuiTextColor>
              <EuiIcon type={iconType} color={badgeColor(data?.status)} />{" "}
              <EuiBadge color={badgeColor(data?.status)}>{data?.status}</EuiBadge>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText textAlign="right">
              {translate("created")}: {data?.created_by}
            </EuiText>
            <EuiText textAlign="right" size="s">
              <em>{moment(data?.created_at).format("YYYY-MM-DD LT")}</em>
            </EuiText>
            <hr />
            <EuiText textAlign="right">
              {translate("updated")}: {data?.updated_by}
            </EuiText>
            <EuiText textAlign="right" size="s">
              <em>{moment(data?.updated_at).format("YYYY-MM-DD LT")}</em>
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
        {data?.description && (
          <EuiFlexItem>
            <EuiPanel hasShadow={false}>
              <EuiText>{data?.description || "-"}</EuiText>
            </EuiPanel>
          </EuiFlexItem>
        )}
        <EuiFlexItem>
          <EuiFlexGroup>
            <EuiPanel hasBorder={true}>
              <ReccurenceRuleLayout />
            </EuiPanel>
          </EuiFlexGroup>
        </EuiFlexItem>

        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiPanel hasBorder={true}>
              <h3>Sent</h3>
              <EuiFlexGrid columns={3}>
                <EuiFlexItem>
                  <EuiText>{data?.aud_count}</EuiText>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiText color="success">{countData?.success_count}</EuiText>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiText color="danger">{countData?.error_count}</EuiText>
                </EuiFlexItem>
              </EuiFlexGrid>
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiPanel hasBorder={true}>
              <h3>Opened</h3>
              {countData?.total_sent_count > 0 && (
                <EuiFlexGrid columns={2}>
                  <EuiFlexItem>
                    <EuiText color="success">
                      {(countData?.opened_count / countData?.total_sent_count * 100).toFixed(2)}%
                    </EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <EuiText color="primary">{countData?.opened_count}</EuiText>
                  </EuiFlexItem>
                </EuiFlexGrid>
              )}
              {countData?.total_sent_count <= 0 && (
                <EuiFlexItem>
                  <EuiText color="success">-</EuiText>
                </EuiFlexItem>
              )}
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiPanel hasBorder={true}>
              <h3>Clicked</h3>
              {countData?.opened_count > 0 && (
                <EuiFlexGrid columns={2}>
                  <EuiFlexItem>
                    <EuiText color="primary">
                      {(countData?.clicked_count / countData?.opened_count * 100).toFixed(2)}%
                    </EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <EuiText color="muted">{countData?.clicked_count}</EuiText>
                  </EuiFlexItem>
                </EuiFlexGrid>
              )}
              {countData?.opened_count <= 0 && (
                <EuiFlexItem>
                  <EuiText color="success">-</EuiText>
                </EuiFlexItem>
              )}
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiFlexItem>
          <div>
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
                  onClick={closeRetargetPopover}
                  disabled={data.kind != "email"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Нээсэн харилцагчид</span>
                    <span>(~{countData?.opened_count})</span>
                  </div>
                </EuiContextMenuItem>
                <EuiContextMenuItem
                  key="item-2"
                  icon="indexOpen"
                  size="s"
                  onClick={closeRetargetPopover}
                  disabled={data.kind != "email"}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between", minWidth: "200px" }}
                  >
                    <span>Нээгээгүй харилцагчид</span>
                    <span>(~{countData?.total_sent_count - countData?.opened_count})</span>
                  </div>
                </EuiContextMenuItem>
                <EuiContextMenuItem
                  key="item-1"
                  icon="indexOpen"
                  size="s"
                  onClick={closeRetargetPopover}
                  disabled={data.kind != "email"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Дарсан харилцагчид</span>
                    <span>(~{countData?.clicked_count})</span>
                  </div>
                </EuiContextMenuItem>
                <EuiContextMenuItem
                  key="item-2"
                  icon="indexOpen"
                  size="s"
                  onClick={closeRetargetPopover}
                  disabled={data.kind != "email"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Дараагүй харилцагчид</span>
                    <span>(~{countData?.total_sent_count - countData?.clicked_count})</span>
                  </div>
                </EuiContextMenuItem>
              </EuiContextMenuPanel>
            </EuiPopover>
          </div>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
};

export default CampaignGeneralDetails;
