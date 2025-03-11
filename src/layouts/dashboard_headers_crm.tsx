// @ts-nocheck

import {
  useIsWithinMaxBreakpoint,
  useGeneratedHtmlId,
  EuiHeader,
  EuiHeaderLogo,
  EuiText,
} from "@elastic/eui";
import { useRouter } from "next/router";
import ThemeSwitcher from "../components/chrome/theme_switcher";
import ChangeProductButton from "../components/dashboards/change_product_button";
import CollapsibleNav from "../components/dashboards/collapsible_nav";
import HeaderUserMenu from "../components/dashboards/header_user_menu";
import TeamSwitcher from "../components/dashboards/team_switcher";

const DashboardHeadersCRM = () => {
  const router = useRouter();
  const largeMaxBreakpoint = useIsWithinMaxBreakpoint("l");
  const leftSectionItems = [<CollapsibleNav key={useGeneratedHtmlId()} />];

  return (
    <>
      <EuiHeader
        sections={[
          {
            items: [
              largeMaxBreakpoint && leftSectionItems,
              <ChangeProductButton key={useGeneratedHtmlId()} />,
              <EuiText
                key="elastic-logo"
                style={{ cursor: "pointer" }}
                onClick={() => router.push(`/dashboards/crm`)}
              >
                {!largeMaxBreakpoint ? "CRM" : ""}
              </EuiText>,
            ],
          },
          {
            items: [
              <TeamSwitcher key={useGeneratedHtmlId()} />,
              <ThemeSwitcher key={useGeneratedHtmlId()} />,
              <HeaderUserMenu key={useGeneratedHtmlId()} />,
            ],
          },
        ]}
      />
    </>
  );
};

export default DashboardHeadersCRM;
