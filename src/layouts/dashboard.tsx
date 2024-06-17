import { EuiPageSidebarProps, EuiPageTemplate, EuiPanel } from "@elastic/eui";
import { useRouter } from "next/router";
import { ReactElement, useContext } from "react";
import { SWRConfig } from "swr";
import useProfile from "../hooks/useProfile";
import useTeams from "../hooks/useTeams";
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
  const { removeUserTokenData } = useContext(authContext);
  const { clearCurrentTeam } = useContext(teamsContext);
  const { isLoading: profileIsLoading, error: profileError } = useProfile();
  const { isLoading: teamsIsLoading, error: teamsError } = useTeams();

  if (profileIsLoading || teamsIsLoading) {
    return <div>...loading</div>;
  }

  if (profileError || teamsError) {
    return <div>...error</div>;
  }

  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        onError: async (error) => {
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
            {sidebar && (
              <EuiPageTemplate.Sidebar sticky={sidebarSticky}>{sidebar}</EuiPageTemplate.Sidebar>
            )}
            {pageHeader && <EuiPageTemplate.Header {...pageHeader} />}
            {breadCrumb && (
              <EuiPageTemplate.Section grow={false}>
                <EuiPanel>{breadCrumb}</EuiPanel>
              </EuiPageTemplate.Section>
            )}
            <EuiPageTemplate.Section>{children}</EuiPageTemplate.Section>
          </EuiPageTemplate>
        </div>
      </div>
    </SWRConfig>
  );
};

export default DashboardLayout;
