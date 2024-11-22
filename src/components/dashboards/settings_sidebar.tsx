import { EuiFlexGroup, EuiFlexItem, EuiSideNav, htmlIdGenerator } from "@elastic/eui";
import { useRouter } from "next/router";
import { useContext, useMemo, useState } from "react";
import { teamsContext } from "../../store/teams_store";

const managementPaths = [
  {
    path: "/dashboards/settings/management",
    name: "Teams",
    roles: ["admin", "manager", "member"],
  },
  {
    path: "/dashboards/settings/management/api-keys",
    name: "Api keys",
    roles: ["admin", "manager", "member"],
  },
];

const SettingsSidebar = () => {
  const router = useRouter();
  const { myProfile } = useContext(teamsContext);

  const [isSideNavOpenOnMobile, setisSideNavOpenOnMobile] = useState(false);

  const toggleOpenOnMobile = () => {
    setisSideNavOpenOnMobile(!isSideNavOpenOnMobile);
  };

  const managementPathsFiltered = useMemo(
    () =>
      managementPaths.filter((path) => {
        return path?.roles ? path?.roles.includes(myProfile?.role) : true;
      }),
    [myProfile?.role],
  );

  const sideNav = [
    {
      name: "Main menu",
      id: htmlIdGenerator("audience&Segments")(),
      items: managementPathsFiltered.map((path) => {
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
    </EuiFlexGroup>
  );
};

export default SettingsSidebar;
