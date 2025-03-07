import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageSection,
  EuiPageSidebar,
  EuiPageSidebarProps,
  EuiPageTemplate,
  useIsWithinMaxBreakpoint,
} from "@elastic/eui";
import { useRouter } from "next/router";
import { ReactElement, useContext } from "react";
import { SWRConfig } from "swr";
import Sidebar from "../components/dashboards/sidebar";
import NoProduct from "../components/no_product";
import { authContext } from "../store/auth_store";
import { teamsContext } from "../store/teams_store";
import { dashboardsLayoutStyles } from "./dashboard.styles";
import DashboardHeaders from "./dashboard_headers";
import NoTeam from "../components/no_team";

const Content = ({
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
  const styles = dashboardsLayoutStyles();
  const { isCDPEnabled, teams } = useContext(teamsContext);
  const largeMaxBreakpoint = useIsWithinMaxBreakpoint("l");

  if (teams?.length === 0) {
    return <NoTeam />;
  }

  if (!isCDPEnabled) {
    return <NoProduct />;
  }

  if (isCDPEnabled) {
    return (
      <div css={styles.contentWrapper}>
        <EuiPage {...rest}>
          {!largeMaxBreakpoint && (
            <EuiPageSidebar paddingSize="l" sticky={sidebarSticky || true} hasEmbellish={true}>
              <Sidebar />
            </EuiPageSidebar>
          )}
          <EuiPageBody panelled>
            <DashboardHeaders />
            <EuiPageHeader bottomBorder paddingSize="l" {...pageHeader} />
            <EuiPageSection paddingSize="l">{children}</EuiPageSection>
          </EuiPageBody>
        </EuiPage>
      </div>
    );
  }
};

const DashboardLayout = ({
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
        <Content {...{ sidebar, sidebarSticky, pageHeader, breadCrumb, hideSidebar, ...rest }}>
          {children}
        </Content>
      </div>
    </SWRConfig>
  );
};

export default DashboardLayout;
