import { EuiPageSidebarProps, EuiPageTemplate, EuiPanel } from "@elastic/eui";
import { ReactElement, useContext, useEffect } from "react";
import useProfile from "../hooks/useProfile";
import { authContext } from "../store/auth_store";
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
  const styles = dashboardsLayoutStyles();
  const { setUser } = useContext(authContext);

  const { data, error, isLoading } = useProfile();

  // TODO: "Change the user data to the actual user data from the API response.";
  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data, setUser]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  //TODO: "Change the error message to the actual error message from the API response."
  // if (error) {
  //   return <div>Error...</div>;
  // }

  return (
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
  );
};

export default DashboardLayout;
