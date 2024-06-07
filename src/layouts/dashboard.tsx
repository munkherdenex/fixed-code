import { EuiPageTemplate } from "@elastic/eui";
import { ReactElement } from "react";
import { dashboardsLayoutStyles } from "./dashboard.styles";
import DashboardHeaders from "./dashboard_headers";

const DashboardLayout = ({ children, pageHeader, ...rest }: { pageHeader?: any; children: ReactElement }) => {
  const styles = dashboardsLayoutStyles();

  return (
    <div css={styles.mainWrapper}>
      <DashboardHeaders />
      <div css={styles.contentWrapper}>
        <EuiPageTemplate restrictWidth panelled={false} bottomBorder={true} {...rest}>
          {pageHeader && <EuiPageTemplate.Header {...pageHeader} />}
          <EuiPageTemplate.Section>{children}</EuiPageTemplate.Section>
        </EuiPageTemplate>
      </div>
    </div>
  );
};

export default DashboardLayout;
