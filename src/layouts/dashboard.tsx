import { EuiPageSidebarProps, EuiPageTemplate, useIsWithinMaxBreakpoint } from "@elastic/eui";
import { useRouter } from "next/router";
import { ReactElement, useContext } from "react";
import { SWRConfig } from "swr";
import Sidebar from "../components/dashboards/sidebar";
import { authContext } from "../store/auth_store";
import { teamsContext } from "../store/teams_store";
import { dashboardsLayoutStyles } from "./dashboard.styles";
import DashboardHeaders from "./dashboard_headers";

const DashboardLayout = ({
  children,
  sidebar,
  sidebarSticky,
  pageHeader,
  breadCrumb,
  ...rest
}: {
  pageHeader?: any;
  children: ReactElement;
  sidebar?: ReactElement;
  breadCrumb?: ReactElement;
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
        <DashboardHeaders />
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
                <Sidebar />
              </EuiPageTemplate.Sidebar>
            )}
            {pageHeader && <EuiPageTemplate.Header {...pageHeader} />}
            {/* INFO: breadCrumb arilgasan  */}
            {/* {breadCrumb && ( */}
            {/*   <EuiPageTemplate.Section grow={false}> */}
            {/*     <EuiPanel>{breadCrumb}</EuiPanel> */}
            {/*   </EuiPageTemplate.Section> */}
            {/* )} */}
            <EuiPageTemplate.Section>{children}</EuiPageTemplate.Section>
          </EuiPageTemplate>
        </div>
      </div>
    </SWRConfig>
  );
};

export default DashboardLayout;
