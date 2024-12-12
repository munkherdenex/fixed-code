import Head from "next/head";
import AdminManagerComponent from "../../../../../components/admin_manager_component";
import GeneralDetails from "../../../../../components/channels/general_details";
import DashboardLayout from "../../../../../layouts/dashboard";
import { GetStaticProps } from "next/types";
import { useTranslations } from "next-intl";

const ChannelInfo = () => {
  const translate = useTranslations();

  return (
    <>
      <Head>
        <title>{translate("channel_details")}</title>
      </Head>
      <AdminManagerComponent page>
        <DashboardLayout
          pageHeader={{
            pageTitle: translate("channel_details"),
            iconType: "spacesApp",
          }}
        >
          <>
            <GeneralDetails />
          </>
        </DashboardLayout>
      </AdminManagerComponent>
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
  const channel = (await import(`../../../../../messages/${context.locale}/channel.json`)).default;
  const common = (await import(`../../../../../messages/${context.locale}/common.json`)).default;

  return {
    props: {
      messages: {
        ...channel,
        ...common,
      },
    },
  };
};

export default ChannelInfo;
