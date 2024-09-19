import { EuiBreadcrumbs, EuiFlexGroup, EuiFlexItem, useGeneratedHtmlId } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import { memo } from "react";
import CampaignInfoActions from "../../../../components/campaign/campaign_info_actions";
import EmailGeneralDetails from "../../../../components/campaign/email_general_detail";
import GeneralDetails from "../../../../components/campaign/general_detail";
import Menu from "../../../../components/campaign/menu";
import DashboardLayout from "../../../../layouts/dashboard";
import { CampaignProvider, useCampaignContext } from "../../../../store/campaign_store";
import { getDataKind } from "../../../../utils/helper";

const CampaignInfoContent = () => {
  const { data, isLoading } = useCampaignContext();

  const dataKind = getDataKind(data);
  const isEmail = dataKind === "email";
  const DetailsComponent = memo(isEmail ? EmailGeneralDetails : GeneralDetails);

  if (isLoading) {
    return <div>...loading</div>;
  }

  return (
    <EuiFlexGroup direction={isEmail ? "column" : "row"}>
      <EuiFlexItem grow={4}>
        <DetailsComponent />
      </EuiFlexItem>
      <EuiFlexItem grow={7}>
        <Menu isEmail={isEmail} />
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
