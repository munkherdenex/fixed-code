import { EuiPanel, EuiTab, EuiTabs } from "@elastic/eui";
import { useMemo, useState } from "react";
import Logs from "./logs";

const tabs = [
  {
    id: "logs--id",
    name: "Logs",
    href: "#logs--id",
    content: (
      <div id="logs--id">
        <Logs />
      </div>
    ),
  },
];

const Overview = () => {
  const [selectedTabId, setSelectedTabId] = useState(() => {
    return window.location.hash ? window.location.hash.substring(1) : tabs?.[0]?.id;
  });

  const selectedTabContent = useMemo(() => {
    return tabs.find((obj) => obj.id === selectedTabId)?.content;
  }, [selectedTabId]);

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
      <EuiPanel>{selectedTabContent}</EuiPanel>
    </>
  );
};

export default Overview;
