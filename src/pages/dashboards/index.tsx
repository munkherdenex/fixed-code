import { FunctionComponent } from "react";
import Head from "next/head";
import { EuiButton, EuiCard, EuiFlexGrid, EuiFlexItem, EuiIcon, useEuiTheme } from "@elastic/eui";
import DashboardLayout from "../../layouts/dashboard";
import { dashboardsStyles } from "../../styles/dashboards.styles";

const pathPrefix = process.env.PATH_PREFIX;

const Dashboard: FunctionComponent = () => {
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
              icon={<EuiIcon size="xxl" type="spacesApp" />}
              title="Sends"
              description="Example of a short card description."
              footer={
                <div>
                  <EuiButton href={`${pathPrefix}/dashboards/segments`} aria-label="Go to segments">
                    Go for it
                  </EuiButton>
                </div>
              }
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCard
              icon={<EuiIcon size="xxl" type="usersRolesApp" />}
              title="Customers"
              description="Example of a longer card description. See how the footers stay lined up."
              footer={
                <div>
                  <EuiButton
                    href={`${pathPrefix}/dashboards/customers`}
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
              title="Segments"
              description="Example of a short card description."
              footer={
                <div>
                  <EuiButton
                    href={`${pathPrefix}/dashboards/segments`}
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
              icon={<EuiIcon size="xxl" type="visualizeApp" />}
              title="Analytics"
              description="Example of a short card description."
              footer={
                <div>
                  <EuiButton
                    href={`${pathPrefix}/dashboards/analytics`}
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
              icon={<EuiIcon size="xxl" type="managementApp" />}
              title="Management"
              description="Example of a short card description."
              footer={
                <div>
                  <EuiButton
                    href={`${pathPrefix}/dashboards/management`}
                    aria-label="Go to Save Objects"
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
