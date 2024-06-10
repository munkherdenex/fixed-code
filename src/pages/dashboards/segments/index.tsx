import { FunctionComponent } from "react";
import Head from "next/head";
import { EuiButton, useEuiTheme } from "@elastic/eui";
import DashboardLayout from "../../../layouts/dashboard";
import { dashboardsStyles } from "../../../styles/dashboards.styles";

const pathPrefix = process.env.PATH_PREFIX;

const Dashboard: FunctionComponent = () => {
  const { euiTheme } = useEuiTheme();
  const styles = dashboardsStyles(euiTheme);

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Segments",
          iconType: "dashboardApp",
          description: "Create and manage segments.",
          rightSideItems: [
            <EuiButton color="primary" href={`${pathPrefix}/dashboards/segments/create`} fill key="create-segment">
              Create segment
            </EuiButton>,
          ],
        }}
      >
        <div css={styles.container}>content</div>
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
