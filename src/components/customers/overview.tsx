import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiTab,
  EuiTabs,
  EuiText,
  EuiTimeline,
  EuiTimelineProps,
} from "@elastic/eui";
import { Fragment, useMemo, useState } from "react";
import Logs from "./logs";

const items: EuiTimelineProps["items"] = [
  {
    icon: "email",
    iconAriaLabel: "Invitation",
    children: (
      <EuiText size="s">
        <p>
          <strong>janet@elastic.co</strong> was invited to the project.
        </p>
      </EuiText>
    ),
  },
  {
    icon: "pencil",
    iconAriaLabel: "Edited",
    children: (
      <EuiText size="s">
        <p>
          The project was renamed to <strong>Revenue Dashboard</strong>.
        </p>
      </EuiText>
    ),
  },
  {
    icon: "folderClosed",
    iconAriaLabel: "Project closed",
    children: (
      <EuiText size="s">
        <p>The project was archived.</p>
      </EuiText>
    ),
  },
];

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
