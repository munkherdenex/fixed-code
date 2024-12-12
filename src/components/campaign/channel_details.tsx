import {
  EuiBadge,
  EuiButtonIcon,
  EuiCodeBlock,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSkeletonRectangle,
  EuiToolTip,
} from "@elastic/eui";
import { jsonrepair } from "jsonrepair";
import moment from "moment";
import useGetChannels, { Channels } from "../../hooks/useGetChannels";
import { badgeColor } from "../../utils/badge_color";
import { useCampaignContext } from "../../store/campaign_store";
import { useRouter } from "next/router";
import { useState } from "react";
import ChangeChannelFlyout from "./change_channel_flyout";
import { useTranslations } from "next-intl";

const ChannelDetails = () => {
  const router = useRouter();
  const translate = useTranslations();

  const { data: templateData } = useCampaignContext();
  const { data, isLoading } = useGetChannels<Channels>(templateData?.channel?.toString());

  const [isChangeChannelFlyoutVisible, setIsChangeChannelFlyoutVisible] = useState(false);

  const templateStatus = templateData?.status;

  return (
    <EuiSkeletonRectangle isLoading={isLoading} width="100%" height={390}>
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiPanel paddingSize="s" color="subdued">
            <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
              <EuiFlexItem grow={false}>
                <strong>{translate("channel_details")}</strong>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup responsive={false} gutterSize="s">
                  {templateStatus !== "APPROVED" && templateStatus !== "PUBLISHED" && (
                    <EuiFlexItem grow={false}>
                      <EuiToolTip position="top" content="Menu">
                        <EuiButtonIcon
                          display="base"
                          color="success"
                          iconType="indexEdit"
                          aria-label="indexEdit"
                          onClick={() => setIsChangeChannelFlyoutVisible(true)}
                        />
                      </EuiToolTip>
                    </EuiFlexItem>
                  )}
                  <EuiFlexItem grow={false}>
                    <EuiToolTip position="top" content="Jump to channel">
                      <EuiButtonIcon
                        display="base"
                        iconType="arrowRight"
                        aria-label="jump"
                        color="primary"
                        onClick={() => router.push(`/dashboards/cdp/channels/info/${data?.id}`)}
                      />
                    </EuiToolTip>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFlexGrid columns={2}>
            <EuiFlexItem>{translate("name")}:</EuiFlexItem>
            <EuiFlexItem>{data?.name}</EuiFlexItem>
            <EuiFlexItem>{translate("channel_type")}:</EuiFlexItem>
            <EuiFlexItem>
              <div>
                <EuiBadge color={badgeColor(data?.channel_type)}>{data?.channel_type}</EuiBadge>
              </div>
            </EuiFlexItem>
            <EuiFlexItem>{translate("data")}:</EuiFlexItem>
            <EuiFlexItem>
              <EuiCodeBlock
                language="json"
                fontSize="s"
                paddingSize="s"
                lineNumbers
                isCopyable
                overflowHeight={300}
              >
                <pre>{JSON.stringify(JSON.parse(jsonrepair(data?.data || "{}")), null, 2)}</pre>
              </EuiCodeBlock>
            </EuiFlexItem>
            <EuiFlexItem>{translate("created_date")}:</EuiFlexItem>
            <EuiFlexItem>{moment(data?.created_at).format("YYYY-MM-DD LT")}</EuiFlexItem>
            <EuiFlexItem>{translate("updated_date")}:</EuiFlexItem>
            <EuiFlexItem>{moment(data?.updated_at).format("YYYY-MM-DD LT")}</EuiFlexItem>
          </EuiFlexGrid>
        </EuiFlexItem>
      </EuiFlexGroup>
      {isChangeChannelFlyoutVisible && (
        <ChangeChannelFlyout closeFlyout={() => setIsChangeChannelFlyoutVisible(false)} />
      )}
    </EuiSkeletonRectangle>
  );
};

export default ChannelDetails;
