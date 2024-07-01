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
          name: "Profile",
          id: htmlIdGenerator("Profile")(),
          isSelected: active === "settings",
          onClick: () => {
            router.push(`${pathPrefix}/dashboards/management/profile`);
          },
        },
        {
          name: "Security",
          id: htmlIdGenerator("Security")(),
          isSelected: active === "security",
          onClick: () => {
            router.push(`${pathPrefix}/dashboards/management/security`);
          },
        },
        {
          name: "Team",
          id: htmlIdGenerator("Team")(),
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
        ,
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
