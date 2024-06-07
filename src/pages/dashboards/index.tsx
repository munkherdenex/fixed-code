import { FunctionComponent } from "react";
import Head from "next/head";
import {
  EuiButton,
  EuiCard,
  EuiFlexGrid,
  EuiFlexItem,
  EuiIcon,
  EuiLink,
  EuiSpacer,
  EuiText,
  useEuiTheme,
} from "@elastic/eui";
import DashboardLayout from "../../layouts/dashboard";
import { dashboardsStyles } from "../../styles/dashboards.styles";

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
              icon={<EuiIcon size="xxl" type="users" />}
              title="Segments"
              description="Example of a short card description."
              footer={
                <div>
                  <EuiButton href="/dashboards/segments" aria-label="Go to segments">
                    Go for it
                  </EuiButton>
                  <EuiSpacer size="xs" />
                  <EuiText size="s">
                    <p>
                      Or try <EuiLink href="http://google.com">this</EuiLink>
                    </p>
                  </EuiText>
                </div>
              }
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCard
              icon={<EuiIcon size="xxl" type="dashboardApp" />}
              title="Dashboards"
              description="Example of a longer card description. See how the footers stay lined up."
              footer={
                <div>
                  <EuiButton aria-label="Go to Dashboards">Go for it</EuiButton>
                  <EuiSpacer size="xs" />
                  <EuiText size="s">
                    <p>
                      Or try <EuiLink href="http://google.com">this</EuiLink>
                    </p>
                  </EuiText>
                </div>
              }
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCard
              icon={<EuiIcon size="xxl" type="savedObjectsApp" />}
              title="Save Objects"
              description="Example of a short card description."
              footer={
                <div>
                  <EuiButton aria-label="Go to Save Objects">Go for it</EuiButton>
                  <EuiSpacer size="xs" />
                  <EuiText size="s">
                    <p>
                      Or try <EuiLink href="http://google.com">this</EuiLink>
                    </p>
                  </EuiText>
                </div>
              }
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCard
              icon={<EuiIcon size="xxl" type="savedObjectsApp" />}
              title="Save Objects"
              description="Example of a short card description."
              footer={
                <div>
                  <EuiButton aria-label="Go to Save Objects">Go for it</EuiButton>
                  <EuiSpacer size="xs" />
                  <EuiText size="s">
                    <p>
                      Or try <EuiLink href="http://google.com">this</EuiLink>
                    </p>
                  </EuiText>
                </div>
              }
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCard
              icon={<EuiIcon size="xxl" type="savedObjectsApp" />}
              title="Save Objects"
              description="Example of a short card description."
              footer={
                <div>
                  <EuiButton aria-label="Go to Save Objects">Go for it</EuiButton>
                  <EuiSpacer size="xs" />
                  <EuiText size="s">
                    <p>
                      Or try <EuiLink href="http://google.com">this</EuiLink>
                    </p>
                  </EuiText>
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
