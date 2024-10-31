import { EuiSpacer, EuiTab, EuiTabs } from "@elastic/eui";
import Head from "next/head";
import { useState, useMemo, Fragment } from "react";
import SecurityComponent from "../../../../components/management/security";
import Settings from "../../../../components/management/settings";
import DashboardLayout from "../../../../layouts/dashboard";

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

const Management = () => {
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
      <Head>
        <title>Management</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Profile settings",
          iconType: "managementApp",
        }}
      >
        <>
          <EuiTabs>{renderTabs()}</EuiTabs>
          <EuiSpacer />
          {selectedTabContent}
        </>
      </DashboardLayout>
    </>
  );
};

export default Management;
