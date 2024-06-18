import { EuiSideNav, htmlIdGenerator } from "@elastic/eui";
import { useRouter } from "next/router";
import { useState } from "react";

const pathPrefix = process.env.PATH_PREFIX;

const Sidebar = ({ active }: { active: string }) => {
  const router = useRouter();
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
          isSelected: active === "teamMembers",
          onClick: () => {
            router.push(`${pathPrefix}/dashboards/management`);
          },
        },
        {
          name: "API keys",
          id: htmlIdGenerator("api-keys")(),
          isSelected: active === "api-keys",
          onClick: () => {
            router.push(`${pathPrefix}/dashboards/management/api-keys`);
          },
        },
        {
          name: "Settings",
          id: htmlIdGenerator("Settings")(),
          isSelected: active === "settings",
          onClick: () => {
            router.push(`${pathPrefix}/dashboards/management/settings`);
          },
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
