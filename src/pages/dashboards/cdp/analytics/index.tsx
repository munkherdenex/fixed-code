import {
  EuiFlexGrid,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  useGeneratedHtmlId,
} from "@elastic/eui";
import Head from "next/head";
import DashboardLayout from "../../../../layouts/dashboard";
import Customer from "../../../../components/analytics/customer";
import Campaign from "../../../../components/analytics/campaign";
import CampaignStatus from "../../../../components/analytics/campaign_status";
import CampaignStatusTable from "../../../../components/analytics/campaign_status_table";
import { useTranslations } from "next-intl";

const Analytics = () => {
  const translate = useTranslations();

  return (
    <>
      <Head>
        <title>{translate("analytics")}</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: translate("analytics"),
          iconType: "reportingApp",
        }}
      >
        <Customer />
        <EuiSpacer size="l" />
        <Campaign />
        <EuiSpacer size="l" />
        <EuiFlexGrid columns={2} gutterSize='l'>
          <EuiFlexItem>
            <CampaignStatus />
          </EuiFlexItem>
          <EuiFlexItem>
            <CampaignStatusTable />
          </EuiFlexItem>
        </EuiFlexGrid>
      </DashboardLayout>
    </>
  );
};

export async function getStaticProps(context) {
  const campaign = (await import(`../../../../messages/${context.locale}/campaign.json`)).default;
  const common = (await import(`../../../../messages/${context.locale}/common.json`)).default;

  return {
    props: {
      messages: {
        ...campaign,
        ...common,
      },
    },
  };
}

export default Analytics;
