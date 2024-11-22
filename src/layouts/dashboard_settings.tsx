import { EuiPageSidebarProps, EuiPageTemplate, useIsWithinMaxBreakpoint } from "@elastic/eui";
import { useRouter } from "next/router";
import { ReactElement, useContext } from "react";
import { SWRConfig } from "swr";
import SettingsSidebar from "../components/dashboards/settings_sidebar";
import { authContext } from "../store/auth_store";
import { teamsContext } from "../store/teams_store";
import { dashboardsLayoutStyles } from "./dashboard.styles";
import DashboardHeadersSettings from "./dashboard_headers_settings";

const DashboardSettings = ({
  children,
  sidebar,
  sidebarSticky,
  pageHeader,
  breadCrumb,
  hideSidebar,
  ...rest
}: {
  pageHeader?: any;
  children: ReactElement;
  sidebar?: ReactElement;
  breadCrumb?: ReactElement;
  hideSidebar?: boolean;
  sidebarSticky?: EuiPageSidebarProps["sticky"];
}) => {
  const router = useRouter();
  const styles = dashboardsLayoutStyles();
  const largeMaxBreakpoint = useIsWithinMaxBreakpoint("l");
  const { removeUserTokenData } = useContext(authContext);
  const { clearCurrentTeam } = useContext(teamsContext);

  return (
    <SWRConfig
      value={{
        onError: async (error) => {
          console.error(error);
          if (error?.status === 401 && router.pathname.includes("dashboard")) {
            removeUserTokenData();
            clearCurrentTeam();
          }
        },
      }}
    >
      <div css={styles.mainWrapper}>
        <DashboardHeadersSettings />
        <div css={styles.contentWrapper}>
          <EuiPageTemplate
            style={{ paddingBlockStart: 48 }}
            restrictWidth
            panelled={false}
            bottomBorder={true}
            {...rest}
          >
            {!largeMaxBreakpoint && !hideSidebar && (
              <EuiPageTemplate.Sidebar sticky={sidebarSticky || true}>
                <SettingsSidebar />
              </EuiPageTemplate.Sidebar>
            )}
            {pageHeader && <EuiPageTemplate.Header {...pageHeader} />}
            <EuiPageTemplate.Section>{children}</EuiPageTemplate.Section>
          </EuiPageTemplate>
        </div>
      </div>
    </SWRConfig>
  );
};

export default DashboardSettings;
