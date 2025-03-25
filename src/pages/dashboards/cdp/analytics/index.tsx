import { EuiFlexGrid, EuiFlexItem, EuiPanel, EuiSpacer, useGeneratedHtmlId } from "@elastic/eui";
import Head from "next/head";
import DashboardLayout from "../../../../layouts/dashboard";
import Customer from "../../../../components/analytics/customer";
import Campaign from "../../../../components/analytics/campaign";
import CampaignStatus from "../../../../components/analytics/campaign_status";
import CampaignStatusTable from "../../../../components/analytics/campaign_status_table";
import { useTranslations } from "next-intl";
import CampaignActions from "@/components/analytics/campaign_actions";

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
        <div>
          <Campaign />
          <EuiSpacer size="l" />
          <CampaignActions />
          <EuiSpacer size="l" />
          <CampaignStatusTable />
          <EuiSpacer size="l" />
          <Customer />
        </div>
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
