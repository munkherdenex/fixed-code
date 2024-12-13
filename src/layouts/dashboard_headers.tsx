import {
  EuiHeader,
  EuiHeaderLogo,
  useGeneratedHtmlId,
  useIsWithinMaxBreakpoint,
} from "@elastic/eui";
import { useRouter } from "next/router";
import ThemeSwitcher from "../components/chrome/theme_switcher";
import ChangeProductButton from "../components/dashboards/change_product_button";
import CollapsibleNav from "../components/dashboards/collapsible_nav";
import HeaderUserMenu from "../components/dashboards/header_user_menu";
import TeamSwitcher from "../components/dashboards/team_switcher";

const DashboardHeaders = () => {
  const router = useRouter();
  const largeMaxBreakpoint = useIsWithinMaxBreakpoint("l");
  const leftSectionItems = [<CollapsibleNav key={useGeneratedHtmlId()} />];

  return (
    <>
      <EuiHeader
        position="fixed"
        sections={[
          {
            items: [
              <EuiHeaderLogo
                key="elastic-logo"
                iconType="dashboardApp"
                style={{ cursor: "pointer" }}
                onClick={() => router.push(`/dashboards/cdp`)}
              >
                {!largeMaxBreakpoint ? "CDP" : ""}
              </EuiHeaderLogo>,
              <TeamSwitcher key={useGeneratedHtmlId()} />,
              largeMaxBreakpoint && leftSectionItems,
              <ChangeProductButton key={useGeneratedHtmlId()} />,
            ],
          },
          {
            items: [
              <ThemeSwitcher key={useGeneratedHtmlId()} />,
              <HeaderUserMenu key={useGeneratedHtmlId()} />,
            ],
          },
        ]}
      />
    </>
  );
};

export default DashboardHeaders;
