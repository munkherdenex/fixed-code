import { useGeneratedHtmlId } from "@elastic/eui";
import Head from "next/head";
import CreateCampaignActionPopover from "../../../../components/campaign/create_campaign_action_popover";
import SendsTable from "../../../../components/campaign/table";
import DashboardLayout from "../../../../layouts/dashboard";
import { useTranslations } from "next-intl";

const SendsDashboard = () => {
  const rightSideItemOneId = useGeneratedHtmlId();
  const translate = useTranslations();

  return (
    <>
      <Head>
        <title>{translate("campaign")}</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: translate("campaign"),
          iconType: "spacesApp",
          rightSideItems: [<CreateCampaignActionPopover key={rightSideItemOneId} />],
        }}
      >
        <div>
          <SendsTable />
        </div>
      </DashboardLayout>
    </>
  );
};

export async function getStaticProps(context) {
  return {
    props: {
      messages: (await import(`../../../../messages/${context.locale}/campaign.json`)).default,
    },
  };
}

export default SendsDashboard;
