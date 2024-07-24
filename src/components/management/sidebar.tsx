import { EuiSideNav, htmlIdGenerator } from "@elastic/eui";
import { useRouter } from "next/router";
import { useState } from "react";

const audienceSegmentPaths = [
  {
    path: "/dashboards/audience",
    name: "Audience",
  },
  {
    path: "/dashboards/custom_attribute",
    name: "Custom attributes",
  },
  {
    path: "/dashboards/segments",
    name: "Segments",
  },
];

const notificationPaths = [
  {
    path: "/dashboards/campaign",
    name: "Campaign",
  },
  {
    path: "/dashboards/channels",
    name: "Channels",
  },
  {
    path: "/dashboards/analytics",
    name: "Analytics",
  },
];

const managementPaths = [
  {
    path: "/dashboards/management/profile",
    name: "Profile",
  },
  {
    path: "/dashboards/management/security",
    name: "Security",
  },
  {
    path: "/dashboards/management",
    name: "Team",
  },
  {
    path: "/dashboards/management/api-keys",
    name: "Api keys",
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
      name: "Audience & Segments",
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
      name: "Notifications",
      id: htmlIdGenerator("notifications")(),
      items: notificationPaths.map((path) => {
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
      name: "Management",
      id: htmlIdGenerator("Management")(),
      items: managementPaths.map((path) => {
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
    <EuiSideNav
      aria-label="Menu"
      mobileTitle="Menu"
      toggleOpenOnMobile={() => toggleOpenOnMobile()}
      isOpenOnMobile={isSideNavOpenOnMobile}
      style={{ width: 192 }}
      items={sideNav}
    />
  );
};

export default Sidebar;
