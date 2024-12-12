import { EuiPanel, EuiTab, EuiTabs } from "@elastic/eui";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import SegmentAudienceList from "./segment_audience_list";

const Menu = () => {
  const translate = useTranslations();

  const tabs = useMemo(() => {
    return [
      {
        id: "audience--id",
        name: translate("audience_list"),
        content: <SegmentAudienceList />,
      },
    ];
  }, [translate]);

  const [selectedTabId, setSelectedTabId] = useState("audience--id");

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
      <div>
        <EuiTabs>{renderTabs()}</EuiTabs>
        <EuiPanel>{selectedTabContent}</EuiPanel>
      </div>
    </>
  );
};

export default Menu;
