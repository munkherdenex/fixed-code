import { EuiTab, EuiTabs, EuiSpacer } from "@elastic/eui";
import { Fragment, useState, useMemo } from "react";
import SecurityComponent from "./security";
import Settings from "./settings";

const tabs = [
  {
    id: "edit-profile--id",
    name: "Edit profile",
    content: (
      <Fragment>
        <Settings />
      </Fragment>
    ),
  },
  {
    id: "change-password--id",
    name: "Change passsword",
    content: (
      <Fragment>
        <SecurityComponent />
      </Fragment>
    ),
  },
];

const ManagementProfileTabs = () => {
  const [selectedTabId, setSelectedTabId] = useState("edit-profile--id");
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
      <EuiSpacer />
      {selectedTabContent}
    </>
  );
};

export default ManagementProfileTabs;
