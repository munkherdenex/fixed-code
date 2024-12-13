import { EuiFlexGroup, EuiFlexItem, EuiSideNav, htmlIdGenerator } from "@elastic/eui";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import SideMenu from "./sidebar_menu";
import { useTranslations } from "next-intl";

const Sidebar = () => {
  const router = useRouter();
  const translate = useTranslations();

  const [isSideNavOpenOnMobile, setisSideNavOpenOnMobile] = useState(false);

  const audienceSegmentPaths = useMemo(() => {
    return [
      {
        path: "/dashboards/cdp/audience",
        name: translate("audience"),
      },
      {
        path: "/dashboards/cdp/segments",
        name: translate("segments"),
      },
      {
        path: "/dashboards/cdp/campaign",
        name: translate("campaign"),
      },
      {
        path: "/dashboards/cdp/analytics",
        name: translate("analytics"),
      },
    ];
  }, [translate]);

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
