import { FunctionComponent } from "react";
import Head from "next/head";
import { EuiButton, EuiCard, EuiFlexGrid, EuiFlexItem, EuiIcon, useEuiTheme } from "@elastic/eui";
import DashboardLayout from "../../layouts/dashboard";
import { dashboardsStyles } from "../../styles/dashboards.styles";
import { useRouter } from "next/router";

const pathPrefix = process.env.PATH_PREFIX;

const Dashboard: FunctionComponent = () => {
  const router = useRouter();
  const { euiTheme } = useEuiTheme();
  const styles = dashboardsStyles(euiTheme);

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <DashboardLayout>
        <EuiFlexGrid columns={3} gutterSize="l" css={styles.container}>
          <EuiFlexItem>
            <EuiCard
              icon={<EuiIcon size="xxl" type="usersRolesApp" />}
              title="Audience & Segment"
              description="Example of a longer card description. See how the footers stay lined up."
              footer={
                <div>
                  <EuiButton
                    onClick={() => router.push(`${pathPrefix}/dashboards/customers`)}
                    aria-label="Go to Dashboards"
                  >
                    Go for it
                  </EuiButton>
                </div>
              }
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCard
              icon={<EuiIcon size="xxl" type="notebookApp" />}
              title="Campaign"
              description="Example of a short card description."
              footer={
                <div>
                  <EuiButton
                    onClick={() => router.push(`${pathPrefix}/dashboards/campaign`)}
                    aria-label="Go to Save Objects"
                  >
                    Go for it
                  </EuiButton>
                </div>
              }
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCard
              icon={<EuiIcon size="xxl" type="spacesApp" />}
              title="Settings"
              description="Example of a short card description."
              footer={
                <div>
                  <EuiButton
                    onClick={() => router.push(`${pathPrefix}/dashboards/management/profile`)}
                    aria-label="Go to segments"
                  >
                    Go for it
                  </EuiButton>
                </div>
              }
            />
          </EuiFlexItem>
        </EuiFlexGrid>
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
