import { EuiPanel, EuiTab, EuiTabs } from "@elastic/eui";
import { useMemo, useState } from "react";
import Audience from "./audience";
import Logs from "./logs";
import TestChannelDetails from "./test_channel";
import EditEmailLayout from "./edit_email_layout";

const emailTabs = [
  {
    id: "preview--id",
    name: "Preview",
    content: <EditEmailLayout />,
  },
  {
    id: "audience--id",
    name: "Audience",
    content: <Audience />,
  },
  {
    id: "channel--id",
    name: "Channel",
    content: <TestChannelDetails />,
  },
  {
    id: "logs--id",
    name: "Logs",
    content: <Logs />,
  },
];

const otherTabs = [
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

const Menu = ({ isEmail }: { isEmail?: boolean }) => {
  const [selectedTabId, setSelectedTabId] = useState(isEmail ? "preview--id" : "audience--id");
  const tabs = useMemo(() => (isEmail ? emailTabs : otherTabs), [isEmail]);

  const selectedTabContent = useMemo(() => {
    return tabs.find((obj) => obj.id === selectedTabId)?.content;
  }, [selectedTabId, tabs]);

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
