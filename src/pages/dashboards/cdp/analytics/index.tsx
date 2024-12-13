import {
  EuiAccordion,
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
  const simpleAccordionId = useGeneratedHtmlId({ prefix: "simpleAccordion" });

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
          <EuiAccordion
            id={simpleAccordionId}
            buttonContent={translate("customer-analytics")}
            initialIsOpen
          >
            <EuiPanel color="transparent">
              <Customer />
            </EuiPanel>
          </EuiAccordion>
          <EuiSpacer size="l" />
          <EuiAccordion
            id={simpleAccordionId}
            buttonContent={translate("campaign-analytics")}
            initialIsOpen
          >
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
