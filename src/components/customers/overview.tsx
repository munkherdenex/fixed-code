import { EuiFlexGroup, EuiFlexItem, EuiPanel, EuiTab, EuiTabs } from "@elastic/eui";
import { Fragment, useMemo, useState } from "react";
import Logs from "./logs";

const tabs = [
  {
    id: "logs--id",
    name: "Logs",
    content: (
      <Fragment>
        <EuiPanel>
          <Logs />
        </EuiPanel>
      </Fragment>
    ),
  },
];

const Overview = () => {
  const [selectedTabId, setSelectedTabId] = useState("logs--id");
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
    <div>
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiTabs>{renderTabs()}</EuiTabs>
        </EuiFlexItem>
        <EuiFlexItem>{selectedTabContent}</EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
};

export default Overview;
