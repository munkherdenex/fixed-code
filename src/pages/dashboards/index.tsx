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
import DashboardLayout from "../../layouts/dashboard";
import { dashboardsStyles } from "../../styles/dashboards.styles";
import { useRouter } from "next/router";
import MetricChart from "../../components/metric-chart";
import { useTranslations } from "next-intl";

const pathPrefix = process.env.PATH_PREFIX;

const Dashboard: FunctionComponent = () => {
  const router = useRouter();
  const { euiTheme } = useEuiTheme();
  const styles = dashboardsStyles(euiTheme);
  const t = useTranslations("dashboards.analytics");

  const cardList = useMemo(
    () => [
      {
        icon: "usersRolesApp",
        title: "Audience & Segment",
        description:
          "The audience is the group of people you want to reach with your campaign. A segment is a subset of your audience that you define based on specific criteria.",
        footer: "Go to Dashboards",
        link: `${pathPrefix}/dashboards/audience`,
      },
      {
        icon: "spacesApp",
        title: "Campaign",
        description:
          "The campaign is a marketing initiative that you want to send to your audience. It can be a newsletter, a promotion, or a survey.",
        footer: "Go to Save Objects",
        link: `${pathPrefix}/dashboards/campaign`,
      },
      {
        icon: "managementApp",
        title: "Settings",
        description:
          "The settings are the configurations of your account. You can manage your profile, your team, and your preferences.",
        footer: "Go to segments",
        link: `${pathPrefix}/dashboards/management/profile`,
      },
    ],
    [],
  );

  return (
    <>
      <Head>
        <title>{t("title")}</title>
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
                    title={card.title}
                    description={card.description}
                    footer={
                      <div>
                        <EuiButton onClick={() => router.push(card.link)} aria-label={card.footer}>
                          {t("go-for-it")}
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
      messages: (await import(`../../messages/${context.locale}.json`)).default,
    },
  };
}

export default Dashboard;
