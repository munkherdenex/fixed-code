import { EuiPanel, EuiSkeletonRectangle, EuiTab, EuiTabs } from "@elastic/eui";
import { useMemo, useState } from "react";
import Audience from "./audience";
import CampaignPreviewContainer from "./campaign_preview_container";
import ChannelDetails from "./channel_details";
import Logs from "./logs";
import Graph from "./graph";
import CampaignGeneralDetails from "./campaign_general_detail";
import { useTranslations } from "next-intl";
import { useCampaignContext } from "../../store/campaign_store";

const Menu = () => {
  const translate = useTranslations();
  const { isLoading } = useCampaignContext();

  const tabs = useMemo(
    () => [
      {
        id: "detail",
        name: translate("details"),
        href: "#detail",
        content: (
          <div id="detail">
            <CampaignGeneralDetails />
          </div>
        ),
      },
      {
        id: "preview",
        name: translate("preview"),
        href: "#preview",
        content: (
          <div id="preview">
            <CampaignPreviewContainer />
          </div>
        ),
      },
      {
        id: "audience",
        name: translate("audience"),
        href: "#audience",
        content: (
          <div id="audience">
            <Audience />
          </div>
        ),
      },
      {
        id: "channel",
        name: translate("channel"),
        href: "#channel",
        content: (
          <div id="channel">
            <ChannelDetails />
          </div>
        ),
      },
      {
        id: "logs",
        name: translate("logs"),
        href: "#logs",
        content: (
          <div id="logs">
            <Logs />
          </div>
        ),
      },
      {
        id: "graph",
        name: translate("graph"),
        href: "#graph",
        content: (
          <div id="graph">
            <Graph />
          </div>
        ),
      },
    ],
    [translate],
  );

  const [selectedTabId, setSelectedTabId] = useState(() => {
    return window.location.hash ? window.location.hash.substring(1) : tabs?.[0]?.id;
  });

  const selectedTabContent = useMemo(() => {
    return tabs.find((obj) => obj.id === selectedTabId)?.content;
  }, [selectedTabId, tabs]);

  const onSelectedTabChanged = (tabId: string) => {
    setSelectedTabId(tabId);
  };

  const renderTabs = () => {
    return tabs.map((tab, index) => (
      <EuiTab
        id={tab.id}
        key={index}
        href={tab.href}
        onClick={() => onSelectedTabChanged(tab.id)}
        isSelected={tab.id === selectedTabId}
      >
        {tab.name}
      </EuiTab>
    ));
  };

  return (
    <>
      <EuiTabs>{renderTabs()}</EuiTabs>
      <EuiPanel>
        <EuiSkeletonRectangle isLoading={isLoading} width="100%" height={390}>
          {selectedTabContent}
        </EuiSkeletonRectangle>
      </EuiPanel>
    </>
  );
};

export default Menu;
