import { FunctionComponent, useMemo } from "react";
import Head from "next/head";
import {
  EuiButton,
  EuiCard,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  useEuiTheme,
} from "@elastic/eui";
import { useRouter } from "next/router";
import MetricChart from "../../../components/metric-chart";
import DashboardLayout from "../../../layouts/dashboard";
import { dashboardsStyles } from "../../../styles/dashboards.styles";
import { useTranslations } from "next-intl";

const pathPrefix = process.env.PATH_PREFIX;

const Dashboard: FunctionComponent = () => {
  const router = useRouter();
  const cardListT = useTranslations("dashboards.cdp.analytics.cardlist");
  const { euiTheme } = useEuiTheme();
  const styles = dashboardsStyles(euiTheme);

  const cardList = useMemo(
    () => [
      {
        name: "audience",
        icon: "usersRolesApp",
        link: `${pathPrefix}/dashboards/cdp/audience`,
      },
      {
        name: "campaign",
        icon: "spacesApp",
        link: `${pathPrefix}/dashboards/cdp/campaign`,
      },
      {
        name: "settings",
        icon: "managementApp",
        link: `${pathPrefix}/dashboards/settings/management`,
      },
    ],
    [],
  );

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <DashboardLayout>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <MetricChart />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGrid columns={3} gutterSize="l" css={styles.container}>
              {cardList.map((card, index) => (
                <EuiFlexItem key={index}>
                  <EuiCard
                    icon={<EuiIcon size="xxl" type={card.icon} />}
                    title={cardListT(`${card.name}.title`)}
                    description={cardListT(`${card.name}.description`)}
                    footer={
                      <div>
                        <EuiButton
                          onClick={() => router.push(card.link)}
                          aria-label={cardListT(`${card.name}.footer`)}
                        >
                          {cardListT(`${card.name}.footer`)}
                        </EuiButton>
                      </div>
                    }
                  />
                </EuiFlexItem>
              ))}
            </EuiFlexGrid>
          </EuiFlexItem>
        </EuiFlexGroup>
      </DashboardLayout>
    </>
  );
};

export async function getStaticProps(context) {
  return {
    props: {
      messages: (await import(`../../../messages/${context.locale}.json`)).default,
    },
  };
}

export default Dashboard;
