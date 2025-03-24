import { EuiFlexGroup, EuiFlexItem, EuiSideNav, htmlIdGenerator } from "@elastic/eui";
import { useRouter } from "next/router";
import { useState } from "react";
import CrmSideMenu from "./crm_sidebar_menu";
import Image from 'next/image';

const audienceSegmentPaths = [
  {
    path: "/dashboards/crm/ticket",
    name: "Тикет",
  },
  {
    path: "/dashboards/crm/call",
    name: "Дуудлага",
  },
  {
    path: "/dashboards/crm/chat",
    name: "Чат",
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
      name: "Харилцагчид",
      id: htmlIdGenerator("customers")(),
      items: [
        {
          name: "Харилцагчид",
          path: "/dashboards/crm/customer",
        },
      ].map((path) => {
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
    {
      name: "Харицлагчийн үйлчилгээ",
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
        <CrmSideMenu />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default CRMSidebar;
