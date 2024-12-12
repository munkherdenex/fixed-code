import {
  EuiAccordion,
  EuiBreadcrumbs,
  EuiFlexGrid,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  useGeneratedHtmlId,
} from "@elastic/eui";
import Head from "next/head";
import router from "next/router";
import DashboardLayout from "../../../../layouts/dashboard";
import Customer from "../../../../components/analytics/customer";
import Campaign from "../../../../components/analytics/campaign";
import CampaignStatus from "../../../../components/analytics/campaign_status";
import CampaignStatusTable from "../../../../components/analytics/campaign_status_table";

const Analytics = () => {
  const simpleAccordionId = useGeneratedHtmlId({ prefix: "simpleAccordion" });
  return (
    <>
      <Head>
        <title>Audience</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Analytics",
          iconType: "reportingApp",
        }}
        breadCrumb={
          <EuiBreadcrumbs
            breadcrumbs={[
              {
                text: "Dashboards",
                onClick: () => router.push(`/dashboards`),
              },
              {
                text: "Audience",
              },
            ]}
            truncate={false}
            aria-label="Customer info breadCrumb"
          />
        }
      >
        <div>
          <EuiAccordion id={simpleAccordionId} buttonContent="Customer analytics" initialIsOpen>
            <EuiPanel color="transparent">
              <Customer />
            </EuiPanel>
          </EuiAccordion>
          <EuiSpacer size="l" />
          <EuiAccordion id={simpleAccordionId} buttonContent="Campaign analytics" initialIsOpen>
            <EuiPanel color="transparent">
              <Campaign />
              <EuiSpacer size="s" />
              <EuiFlexGrid columns={2}>
                <EuiFlexItem>
                  <CampaignStatus />
                </EuiFlexItem>
                <EuiFlexItem>
                  <CampaignStatusTable />
                </EuiFlexItem>
              </EuiFlexGrid>
            </EuiPanel>
          </EuiAccordion>
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
