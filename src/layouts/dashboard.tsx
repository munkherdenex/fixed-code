import { EuiPageSidebarProps, EuiPageTemplate, EuiPanel } from "@elastic/eui";
import { ReactElement } from "react";
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

  return (
    <div css={styles.mainWrapper}>
      <DashboardHeaders />
      <div css={styles.contentWrapper}>
        <EuiPageTemplate style={{ paddingBlockStart: 48 }} restrictWidth panelled={false} bottomBorder={true} {...rest}>
          {sidebar && <EuiPageTemplate.Sidebar sticky={sidebarSticky}>{sidebar}</EuiPageTemplate.Sidebar>}
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
