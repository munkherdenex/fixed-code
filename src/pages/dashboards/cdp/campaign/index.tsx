import { EuiBreadcrumbs, useGeneratedHtmlId } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import CreateCampaignActionPopover from "../../../../components/campaign/create_campaign_action_popover";
import SendsTable from "../../../../components/campaign/table";
import DashboardLayout from "../../../../layouts/dashboard";

const pathPrefix = process.env.PATH_PREFIX;

const SendsDashboard = () => {
  const router = useRouter();
  const rightSideItemOneId = useGeneratedHtmlId();

  return (
    <>
      <Head>
        <title>Campaign</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Campaign",
          iconType: "spacesApp",
          rightSideItems: [<CreateCampaignActionPopover key={rightSideItemOneId} />],
        }}
        breadCrumb={
          <EuiBreadcrumbs
            breadcrumbs={[
              {
                text: "Dashboards",
                onClick: () => router.push(`${pathPrefix}/dashboards`),
              },
              {
                text: "Campaign",
              },
            ]}
            truncate={false}
          />
        }
      >
        <div>
          <SendsTable />
        </div>
      </DashboardLayout>
    </>
  );
};

export default SendsDashboard;
