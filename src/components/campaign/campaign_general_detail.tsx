import {
  EuiBadge,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiInlineEditText,
  EuiInlineEditTitle,
  EuiPanel,
  EuiText,
  EuiTextColor,
} from "@elastic/eui";
import moment from "moment";
import { useTranslations } from "next-intl";
import useGetCampaignSuccessErrorCount from "../../hooks/useGetCampaignCount";
import { useCampaignContext } from "../../store/campaign_store";
import { badgeColor } from "../../utils/badge_color";
import { getCampaignIcon, getCampaignStatusIcon, getDataKind } from "../../utils/helper";
import ReccurenceRuleLayout from "./reccurence_rule_layout";
import templateApi from "@/api/template";
import { css } from "@emotion/react";

const titleStyle = css`
  .euiTitle {
    line-height: 1.5em;
  }

  .euiFieldText {
    height: 1.5em;
  }

  margin-bottom: 1em;
`;

const CampaignGeneralDetails = () => {
  const translate = useTranslations();
  const { data, mutate } = useCampaignContext();
  const { data: countData } = useGetCampaignSuccessErrorCount(data?.id?.toString());

  //INFO: This is a workaround to get the kind of the template becaouse of POCKET
  const dataKind = getDataKind(data);
  const iconType = getCampaignStatusIcon(data?.start_date != null, data?.is_recurring);

  const updateTitle = async (value) => {
    await templateApi.update(data?.id, { ...data, title: value });
    mutate();
  };

  return (
    <div>
      <EuiFlexGroup direction="column">
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiInlineEditTitle
              heading="h3"
              size="l"
              inputAriaLabel="Гарчиг солих"
              defaultValue={data?.title}
              onSave={updateTitle}
              isReadOnly={data?.status !== "DRAFT"}
              css={titleStyle}
            />
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
              {translate("created")}: {data?.created_by?.email}
            </EuiText>
            <EuiText textAlign="right" size="s">
              <em>{moment(data?.created_at).format("YYYY-MM-DD LT")}</em>
            </EuiText>
            <hr />
            <EuiText textAlign="right">
              {translate("updated")}: {data?.updated_by?.email}
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
                      {((countData?.opened_count / countData?.total_sent_count) * 100).toFixed(2)}%
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
                      {((countData?.clicked_count / countData?.opened_count) * 100).toFixed(2)}%
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
      </EuiFlexGroup>
    </div>
  );
};

export default CampaignGeneralDetails;
