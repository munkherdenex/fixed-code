import { EuiButton, useEuiTheme } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import SegmentsTable from "../../../../components/segments/table";
import DashboardLayout from "../../../../layouts/dashboard";
import { dashboardsStyles } from "../../../../styles/dashboards.styles";
import { useTranslations } from "next-intl";
import { GetStaticProps } from "next/types";

const pathPrefix = process.env.PATH_PREFIX;

const Dashboard: FunctionComponent = () => {
  const segmentsT = useTranslations();
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
          pageTitle: segmentsT("title"),
          iconType: "dashboardApp",
          rightSideItems: [
            <EuiButton
              color="primary"
              onClick={() => router.push(`${pathPrefix}/dashboards/cdp/segments/create`)}
              fill
              key="create-segment"
            >
              {segmentsT("create-segment")}
            </EuiButton>,
          ],
        }}
      >
        <div css={styles.container}>
          <SegmentsTable />
        </div>
      </DashboardLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const common = (await import(`../../../../messages/${context.locale}/common.json`)).default;
  const segments = (await import(`../../../../messages/${context.locale}/segments.json`)).default;

  return {
    props: {
      messages: {
        ...common,
        ...segments,
      },
    },
  };
};

export default Dashboard;
