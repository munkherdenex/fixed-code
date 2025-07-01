// @ts-nocheck

import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiSideNav, EuiButton, htmlIdGenerator } from "@elastic/eui";
import { useRouter } from "next/router";
import { useContext, useMemo, useState } from "react";
import CrmSideMenu from "./crm_sidebar_menu";
import Image from "next/image";
import { teamsContext } from "@/store/teams_store";
import Link from "next/link";

const CRMSidebar = () => {
  const router = useRouter();
  const [isSideNavOpenOnMobile, setisSideNavOpenOnMobile] = useState(false);
  const { isCRMCallEnabled, isCRMChatEnabled, isCRMTicketEnabled } = useContext(teamsContext);
  
  const isPocket = typeof window !== 'undefined' ? window.env?.IS_POCKET : false;
  const audienceSegmentPaths = useMemo(() => {
    return [
      {
        path: "/dashboards/crm/ticket?pageIndex=1&pageSize=10",
        icon: <EuiIcon type="documents" />,
        name: "Тикет",
        disabled: !isCRMTicketEnabled,
      },
      {
        path: "/dashboards/crm/call",
        name: "Дуудлага",
        icon: <EuiIcon type="inputOutput" />,
        disabled: !isCRMCallEnabled,
      },
      {
        path: "/dashboards/crm/chat",
        name: "Чат",
        icon: <EuiIcon type="apmTrace" />,
        disabled: !isCRMChatEnabled,
      },
    ];
  }, [isCRMTicketEnabled, isCRMCallEnabled, isCRMChatEnabled]);

  const toggleOpenOnMobile = () => {
    setisSideNavOpenOnMobile(!isSideNavOpenOnMobile);
  };

  const sideNav = useMemo(() => {
    return [
      {
        name: "Харилцагчид",
        id: htmlIdGenerator("customers")(),
        items: [
          {
            name: "Хэрэглэгчийн түүх",
            path: "/dashboards/crm/customer?phone=",
          },
        ].map((path) => {
          return {
            name: path.name,
            id: htmlIdGenerator(path.name)(),
            isSelected: router.pathname === path.path,
            onClick: () => {
              // console.log(path.path);
              router.push(path.path);
            },
            href: path.path,
          };
        }),
      },
      {
        name: "Харицлагчийн үйлчилгээ",
        id: htmlIdGenerator("ticketsAndContactLogs")(),
        items: audienceSegmentPaths.map((path) => {
          if (path.disabled) {
            return {};
          }
          return {
            name: path.name,
            id: htmlIdGenerator(path.name)(),
            isSelected: router.pathname === path.path,
            icon: path.icon,
            disabled: path.disabled,
            onClick: () => {
              router.push(path.path);
            },
            href: path.path,
          };
        }),
      },
      {
        name: "Тайлан",
        id: htmlIdGenerator("reports")(),
        items: [
          {
            name: "Тайлан",
            path: "#t",
          },
        ].map((path) => {
          return {
            name: path.name,
            id: htmlIdGenerator(path.name)(),
            isSelected: router.pathname === path.path,
            onClick: () => {
              router.push(path.path);
            },
            href: path.path,
          };
        }),
      },
    ];
  }, [audienceSegmentPaths, router]);

  const handleLogoClick = () => {
    router.push("/dashboards/crm");
  };

  return (
    <EuiFlexGroup direction="column" justifyContent="spaceBetween" style={{ height: "100%" }}>
      <EuiFlexItem>
        <EuiSideNav
          heading={
            <Link href="/dashboards/crm" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
              <Image
                src="/images/pocket-logo.png"
                alt="Pocket logo"
                width={200 * 0.5}
                height={57 * 0.5}
              />
            </Link>
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
            <CrmSideMenu />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default CRMSidebar;
