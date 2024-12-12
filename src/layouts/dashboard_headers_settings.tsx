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
import { useContext } from "react";
import { teamsContext } from "../store/teams_store";

const DashboardHeadersSettings = () => {
  const router = useRouter();
  const largeMaxBreakpoint = useIsWithinMaxBreakpoint("l");
  const leftSectionItems = [<CollapsibleNav key={useGeneratedHtmlId()} />];
  const { teams } = useContext(teamsContext);

  const onClick = () => {
    if (teams?.length === 0) {
      router.push(`/dashboards`);
      return;
    }
    router.push(`/dashboards/settings`);
  };

  return (
    <>
      <EuiHeader
        position="fixed"
        sections={[
          {
            items: [
              <EuiHeaderLogo
                key="elastic-logo"
                iconType="managementApp"
                style={{ cursor: "pointer" }}
                onClick={onClick}
              >
                {!largeMaxBreakpoint ? "Settings" : ""}
              </EuiHeaderLogo>,
              largeMaxBreakpoint && leftSectionItems,
              teams?.length > 0 && <ChangeProductButton />,
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

export default DashboardHeadersSettings;
