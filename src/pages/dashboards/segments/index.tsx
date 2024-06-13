import { FunctionComponent } from "react";
import Head from "next/head";
import { EuiBreadcrumbs, EuiButton, useEuiTheme } from "@elastic/eui";
import DashboardLayout from "../../../layouts/dashboard";
import { dashboardsStyles } from "../../../styles/dashboards.styles";

const pathPrefix = process.env.PATH_PREFIX;

const Dashboard: FunctionComponent = () => {
  const { euiTheme } = useEuiTheme();
  const styles = dashboardsStyles(euiTheme);

  return (
    <>
      <Head>
        <title>Create segments</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Segments",
          iconType: "dashboardApp",
          rightSideItems: [
            <EuiButton
              color="primary"
              href={`${pathPrefix}/dashboards/segments/create`}
              fill
              key="create-segment"
            >
              Create segment
            </EuiButton>,
          ],
        }}
        breadCrumb={
          <EuiBreadcrumbs
            breadcrumbs={[
              {
                text: "Dashboards",
                href: `${pathPrefix}/dashboards`,
              },
              {
                text: "Segments",
              },
            ]}
            truncate={false}
          />
        }
      >
        <div css={styles.container}>content</div>
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
