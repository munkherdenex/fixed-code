import { EuiBreadcrumbs, EuiFlexGroup, EuiFlexItem, useGeneratedHtmlId } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import CampaignInfoActions from "../../../../components/campaign/campaign_info_actions";
import CampaignGeneralDetails from "../../../../components/campaign/campaign_general_detail";
import Menu from "../../../../components/campaign/menu";
import DashboardLayout from "../../../../layouts/dashboard";
import { CampaignProvider, useCampaignContext } from "../../../../store/campaign_store";

const CampaignInfoContent = () => {
  const { isLoading } = useCampaignContext();

  if (isLoading) {
    return <div>...loading</div>;
  }

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={4}>
        <CampaignGeneralDetails />
      </EuiFlexItem>
      <EuiFlexItem grow={7}>
        <Menu />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

const CampaignInfo = () => {
  const router = useRouter();
  const campaignInfoActionsId = useGeneratedHtmlId();

  return (
    <>
      <Head>
        <title>Info</title>
      </Head>
      <CampaignProvider>
        <DashboardLayout
          pageHeader={{
            pageTitle: "Campaign info",
            iconType: "spacesApp",
            rightSideItems: [<CampaignInfoActions key={campaignInfoActionsId} />],
          }}
          breadCrumb={
            <EuiBreadcrumbs
              breadcrumbs={[
                {
                  text: "Dashboards",
                  onClick: () => router.push("/dashboards"),
                },
                {
                  text: "Campaign",
                  onClick: () => router.push("/dashboards/campaign"),
                },
                {
                  text: "Info",
                },
              ]}
              truncate={false}
              aria-label="Campaign info breadCrumb"
            />
          }
        >
          <CampaignInfoContent />
        </DashboardLayout>
      </CampaignProvider>
    </>
  );
};

export default CampaignInfo;
