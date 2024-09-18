import { EuiPanel, EuiTab, EuiTabs } from "@elastic/eui";
import { useMemo, useState } from "react";
import Audience from "./audience";
import Logs from "./logs";
import TestChannelDetails from "./test_channel";
import EmailLayouts from "./email_edit_view_container";

const email_tabs = [
  {
    id: "preview--id",
    name: "Preview",
    content: <EmailLayouts />,
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

const Menu = ({ isEmail }: { isEmail?: boolean }) => {
  const [selectedTabId, setSelectedTabId] = useState(isEmail ? "preview--id" : "audience--id");

  const selectedTabContent = useMemo(() => {
    if (isEmail) {
      return email_tabs.find((obj) => obj.id === selectedTabId)?.content;
    }

    return tabs.find((obj) => obj.id === selectedTabId)?.content;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTabId]);

  const onSelectedTabChanged = (id: string) => {
    setSelectedTabId(id);
  };

  const renderTabs = () => {
    const render_tabs = isEmail ? email_tabs : tabs;
    return render_tabs.map((tab, index) => (
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
