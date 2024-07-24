import { EuiBreadcrumbs, EuiButton, useEuiTheme } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import SegmentsTable from "../../../components/segments/table";
import DashboardLayout from "../../../layouts/dashboard";
import { dashboardsStyles } from "../../../styles/dashboards.styles";

const pathPrefix = process.env.PATH_PREFIX;

const Dashboard: FunctionComponent = () => {
  const { euiTheme } = useEuiTheme();
  const router = useRouter();
  const styles = dashboardsStyles(euiTheme);

  return (
    <>
      <Head>
        <title>Segments</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Segments",
          iconType: "dashboardApp",
          rightSideItems: [
            <EuiButton
              color="primary"
              onClick={() => router.push(`${pathPrefix}/dashboards/segments/create`)}
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
                onClick: () => router.push(`${pathPrefix}/dashboards`),
              },
              {
                text: "Segments",
              },
            ]}
            truncate={false}
          />
        }
      >
        <div css={styles.container}>
          <SegmentsTable />
        </div>
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
