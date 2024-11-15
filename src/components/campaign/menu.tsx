import { EuiPanel, EuiTab, EuiTabs } from "@elastic/eui";
import { useMemo, useState } from "react";
import Audience from "./audience";
import CampaignPreviewContainer from "./campaign_preview_container";
import ChannelDetails from "./channel_details";
import Logs from "./logs";
import { useRouter } from "next/router";

const tabs = [
  {
    id: "preview",
    name: "Preview",
    content: <CampaignPreviewContainer />,
  },
  {
    id: "audience",
    name: "Audience",
    content: <Audience />,
  },
  {
    id: "channel",
    name: "Channel",
    content: <ChannelDetails />,
  },
  {
    id: "logs",
    name: "Logs",
    content: <Logs />,
  },
];

const Menu = () => {
  const router = useRouter();
  const { id, tab } = router.query;
  const [selectedTabId, setSelectedTabId] = useState(tab || "preview");

  const selectedTabContent = useMemo(() => {
    return tabs.find((obj) => obj.id === selectedTabId)?.content;
  }, [selectedTabId]);

  const onSelectedTabChanged = (tabId: string) => {
    setSelectedTabId(tabId);
    router.push({
      query: { tab: tabId, id: id },
    });
  };

  const renderTabs = () => {
    return tabs.map((tab, index) => (
      <EuiTab
        key={index}
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
      <EuiPanel>{selectedTabContent}</EuiPanel>
    </>
  );
};

export default Menu;
