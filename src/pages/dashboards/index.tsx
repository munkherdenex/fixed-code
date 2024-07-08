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
              description="The audience is the group of people you want to reach with your campaign. A segment is a subset of your audience that you define based on specific criteria."
              footer={
                <div>
                  <EuiButton
                    onClick={() => router.push(`${pathPrefix}/dashboards/audience`)}
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
              icon={<EuiIcon size="xxl" type="spacesApp" />}
              title="Campaign"
              description="The campaign is a marketing initiative that you want to send to your audience. It can be a newsletter, a promotion, or a survey."
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
              icon={<EuiIcon size="xxl" type="managementApp" />}
              title="Settings"
              description="The settings are the configurations of your account. You can manage your profile, your team, and your preferences."
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
