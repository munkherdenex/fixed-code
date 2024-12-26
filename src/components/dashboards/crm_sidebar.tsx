import { EuiFlexGroup, EuiFlexItem, EuiSideNav, htmlIdGenerator } from "@elastic/eui";
import { useRouter } from "next/router";
import { useState } from "react";
import CrmSideMenu from "./crm_sidebar_menu";

const audienceSegmentPaths = [
  {
    path: "/dashboards/crm/ticket",
    name: "Ticket",
  },
  {
    path: "/dashboards/crm/call",
    name: "Call",
  },
  {
    path: "/dashboards/crm/chat",
    name: "Chat",
  },
  {
    path: "/dashboards/crm/data",
    name: "Data",
  },
];

const CRMSidebar = () => {
  const router = useRouter();
  const [isSideNavOpenOnMobile, setisSideNavOpenOnMobile] = useState(false);

  const toggleOpenOnMobile = () => {
    setisSideNavOpenOnMobile(!isSideNavOpenOnMobile);
  };

  const sideNav = [
    {
      name: "Main menu",
      id: htmlIdGenerator("audience&Segments")(),
      items: audienceSegmentPaths.map((path) => {
        return {
          name: path.name,
          id: htmlIdGenerator(path.name)(),
          isSelected: router.pathname === path.path,
          onClick: () => {
            router.push(path.path);
          },
        };
      }),
    },
  ];

  return (
    <EuiFlexGroup direction="column" justifyContent="spaceBetween" style={{ height: "100%" }}>
      <EuiFlexItem>
        <EuiSideNav
          aria-label="Menu"
          mobileTitle="Menu"
          toggleOpenOnMobile={() => toggleOpenOnMobile()}
          isOpenOnMobile={isSideNavOpenOnMobile}
          items={sideNav}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <CrmSideMenu />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default CRMSidebar;
