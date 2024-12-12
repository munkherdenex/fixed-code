import { useGeneratedHtmlId } from "@elastic/eui";
import { useTranslations } from "next-intl";
import Head from "next/head";
import CampaignInfoActions from "../../../../../components/campaign/campaign_info_actions";
import Menu from "../../../../../components/campaign/menu";
import DashboardLayout from "../../../../../layouts/dashboard";
import { CampaignProvider } from "../../../../../store/campaign_store";
import { GetStaticProps } from "next/types";

const CampaignInfoContent = () => {
  return <Menu />;
};

const CampaignInfo = () => {
  const campaignInfoActionsId = useGeneratedHtmlId();
  const translate = useTranslations();

  return (
    <>
      <Head>
        <title>{translate("campaign_info")}</title>
      </Head>
      <CampaignProvider>
        <DashboardLayout
          pageHeader={{
            pageTitle: translate("campaign_info"),
            iconType: "spacesApp",
            rightSideItems: [<CampaignInfoActions key={campaignInfoActionsId} />],
          }}
        >
          <CampaignInfoContent />
        </DashboardLayout>
      </CampaignProvider>
    </>
  );
};

export async function getStaticPaths() {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
}

export const getStaticProps: GetStaticProps = async (context) => {
  const campaign = (await import(`../../../../../messages/${context.locale}/campaign.json`))
    .default;
  const common = (await import(`../../../../../messages/${context.locale}/common.json`)).default;

  return {
    props: {
      messages: {
        ...campaign,
        ...common,
      },
    },
  };
};

export default CampaignInfo;
