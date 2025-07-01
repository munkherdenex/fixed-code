import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiSideNav,
  EuiSideNavItemType,
  EuiButton,
  htmlIdGenerator,
} from "@elastic/eui";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import SideMenu from "./sidebar_menu";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

const Sidebar = () => {
  const router = useRouter();
  const translate = useTranslations();

  const [isSideNavOpenOnMobile, setisSideNavOpenOnMobile] = useState(false);
  
  const isPocket = typeof window !== 'undefined' ? window.env?.IS_POCKET : false;

  const audienceSegmentPaths = useMemo(() => {
    return [
      {
        path: "/dashboards/cdp",
        name: translate("home"),
        icon: <EuiIcon type="home" />,
      },
      {
        path: "/dashboards/cdp/audience?phone=",
        name: translate("audience"),
        icon: <EuiIcon type="userAvatar" />,
      },
      {
        path: "/dashboards/cdp/segments",
        name: translate("segments"),
        icon: <EuiIcon type="users" />,
      },
      {
        path: "/dashboards/cdp/campaign",
        name: translate("campaign"),
        icon: <EuiIcon type="inputOutput" />,
      },
      {
        path: "/dashboards/cdp/analytics",
        name: translate("analytics"),
        icon: <EuiIcon type="document" />,
      },
    ];
  }, [translate]);

  const toggleOpenOnMobile = () => {
    setisSideNavOpenOnMobile(!isSideNavOpenOnMobile);
  };

  const sideNav: EuiSideNavItemType<Object>[] = [
    {
      id: htmlIdGenerator("root")(),
      name: "",
      items: audienceSegmentPaths.map((path) => {
        return {
          name: path.name,
          id: htmlIdGenerator(path.name)(),
          icon: path.icon,
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
          heading={
            <Image
              src="/images/pocket-logo.png"
              alt="Pocket logo"
              width={200 * 0.5}
              height={57 * 0.5}
            />
          }
          aria-label="Menu"
          mobileTitle="Menu"
          toggleOpenOnMobile={() => toggleOpenOnMobile()}
          isOpenOnMobile={isSideNavOpenOnMobile}
          items={sideNav}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup direction="column" gutterSize="s">
          {!isPocket && (
            <EuiFlexItem grow={false}>
              <Link href="/privacy_policy">
                <EuiButton
                  fullWidth
                  size="s"
                  iconType="document"
                  color="text"
                  style={{ justifyContent: "flex-start" }}
                >
                  Нууцлалын бодлого
                </EuiButton>
              </Link>
            </EuiFlexItem>
          )}
          <EuiFlexItem grow={false}>
            <SideMenu />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default Sidebar;
