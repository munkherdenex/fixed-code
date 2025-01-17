import { EuiPageSidebarProps, EuiPageTemplate, useIsWithinMaxBreakpoint } from "@elastic/eui";
import { useRouter } from "next/router";
import { ReactElement, useContext } from "react";
import { SWRConfig } from "swr";
import CRMSidebar from "../components/dashboards/crm_sidebar";
import NoProduct from "../components/no_product";
import NoTeam from "../components/no_team";
import UnderConstruction from "../components/under_construction";
import { CRM } from "../constants";
import { authContext } from "../store/auth_store";
import { teamsContext } from "../store/teams_store";
import { dashboardsLayoutStyles } from "./dashboard.styles";
import DashboardHeadersCRM from "./dashboard_headers_crm";

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
  const largeMaxBreakpoint = useIsWithinMaxBreakpoint("l");
  const { isCRMEnabled, teams } = useContext(teamsContext);

  if (!CRM) {
    return <UnderConstruction />;
  }

  if (teams?.length === 0) {
    return <NoTeam />;
  }

  if (!isCRMEnabled) {
    return <NoProduct />;
  }

  if (isCRMEnabled) {
    return (
      <div css={styles.contentWrapper}>
        <EuiPageTemplate
          style={{ paddingBlockStart: 48 }}
          restrictWidth
          panelled={false}
          bottomBorder={true}
          {...rest}
        >
          {!largeMaxBreakpoint && (
            <EuiPageTemplate.Sidebar sticky={sidebarSticky || true}>
              <CRMSidebar />
            </EuiPageTemplate.Sidebar>
          )}
          {pageHeader && <EuiPageTemplate.Header restrictWidth={false} {...pageHeader} />}
          <EuiPageTemplate.Section restrictWidth={false}>{children}</EuiPageTemplate.Section>
        </EuiPageTemplate>
      </div>
    );
  }
};

const DashboardCRMLayout = ({
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
        <DashboardHeadersCRM />
        <Content {...{ sidebar, sidebarSticky, pageHeader, breadCrumb, hideSidebar, ...rest }}>
          {children}
        </Content>
      </div>
    </SWRConfig>
  );
};

export default DashboardCRMLayout;
