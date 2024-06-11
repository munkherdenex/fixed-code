import { EuiSideNav, htmlIdGenerator } from "@elastic/eui";
import { useState } from "react";

const pathPrefix = process.env.PATH_PREFIX;

const Sidebar = ({ active }: { active: string }) => {
  const [isSideNavOpenOnMobile, setisSideNavOpenOnMobile] = useState(false);

  const toggleOpenOnMobile = () => {
    setisSideNavOpenOnMobile(!isSideNavOpenOnMobile);
  };

  const sideNav = [
    {
      name: "Management",
      id: htmlIdGenerator("Management")(),
      items: [
        {
          name: "Team members",
          id: htmlIdGenerator("Team members")(),
          href: `${pathPrefix}/dashboards/management`,
          isSelected: active === "teamMembers",
        },
        {
          name: "API keys",
          id: htmlIdGenerator("api-keys")(),
          href: `${pathPrefix}/dashboards/management/api-keys`,
          isSelected: active === "api-keys",
        },
        {
          name: "Settings",
          id: htmlIdGenerator("Settings")(),
          href: `${pathPrefix}/dashboards/management/settings`,
          isSelected: active === "settings",
        },
      ],
    },
  ];

  return (
    <EuiSideNav
      aria-label="Management"
      mobileTitle="Management"
      toggleOpenOnMobile={() => toggleOpenOnMobile()}
      isOpenOnMobile={isSideNavOpenOnMobile}
      style={{ width: 192 }}
      items={sideNav}
    />
  );
};

export default Sidebar;
