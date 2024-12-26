import { EuiTab, EuiTabs, EuiSpacer } from "@elastic/eui";
import { Fragment, useState, useMemo } from "react";
import SecurityComponent from "./security";
import Settings from "./settings";
import { useTranslations } from "next-intl";

const ManagementProfileTabs = () => {
  const translate = useTranslations();

  const tabs = useMemo(() => {
    return [
      {
        id: "edit-profile--id",
        name: translate("edit_profile"),
        content: (
          <Fragment>
            <Settings />
          </Fragment>
        ),
      },
      {
        id: "change-password--id",
        name: translate("change_password"),
        content: (
          <Fragment>
            <SecurityComponent />
          </Fragment>
        ),
      },
    ];
  }, [translate]);

  const [selectedTabId, setSelectedTabId] = useState("edit-profile--id");
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
      <EuiSpacer />
      {selectedTabContent}
    </>
  );
};

export default ManagementProfileTabs;
