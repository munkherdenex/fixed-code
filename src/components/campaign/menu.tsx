import { EuiPanel, EuiTab, EuiTabs } from "@elastic/eui";
import { useMemo, useState } from "react";
import Audience from "./audience";
import Logs from "./logs";

const tabs = [
  {
    id: "audience--id",
    name: "Audience",
    content: <Audience />,
  },
  {
    id: "logs--id",
    name: "Logs",
    content: <Logs />,
  },
];

const Menu = () => {
  const [selectedTabId, setSelectedTabId] = useState("audience--id");

  const selectedTabContent = useMemo(() => {
    return tabs.find((obj) => obj.id === selectedTabId)?.content;
  }, [selectedTabId]);

  const onSelectedTabChanged = (id: string) => {
    setSelectedTabId(id);
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
