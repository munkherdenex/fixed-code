import { EuiFlexGroup, EuiFlexItem, EuiSideNav, htmlIdGenerator } from "@elastic/eui";
import { useRouter } from "next/router";
import { useState } from "react";
import SideMenu from "./sidebar_menu";

const audienceSegmentPaths = [
  {
    path: "/dashboards/audience",
    name: "Audience",
  },
  {
    path: "/dashboards/segments",
    name: "Segments",
  },
  {
    path: "/dashboards/campaign",
    name: "Campaign",
  },
];

const Sidebar = () => {
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
        <SideMenu />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default Sidebar;
