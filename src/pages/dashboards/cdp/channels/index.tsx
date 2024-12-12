import { useEuiTheme, useGeneratedHtmlId } from "@elastic/eui";
import Head from "next/head";
import AdminManagerComponent from "../../../../components/admin_manager_component";
import CreateChannelFlyoutContainer from "../../../../components/channels/create_channel_flyout_container";
import ChannelsTable from "../../../../components/channels/table";
import DashboardLayout from "../../../../layouts/dashboard";
import { dashboardsStyles } from "../../../../styles/dashboards.styles";
import { useTranslations } from "next-intl";
import { GetStaticProps } from "next/types";

const Channels = () => {
  const { euiTheme } = useEuiTheme();
  const styles = dashboardsStyles(euiTheme);
  const rightSideItemOneId = useGeneratedHtmlId();
  const translate = useTranslations();

  return (
    <>
      <Head>
        <title>{translate("channels")}</title>
      </Head>
      <AdminManagerComponent page>
        <DashboardLayout
          pageHeader={{
            pageTitle: translate("channels"),
            iconType: "spacesApp",
            rightSideItems: [<CreateChannelFlyoutContainer key={rightSideItemOneId} />],
          }}
        >
          <div css={styles.container}>
            <ChannelsTable />
          </div>
        </DashboardLayout>
      </AdminManagerComponent>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const channel = (await import(`../../../../messages/${context.locale}/channel.json`)).default;
  const common = (await import(`../../../../messages/${context.locale}/common.json`)).default;

  return {
    props: {
      messages: {
        ...channel,
        ...common,
      },
    },
  };
};

export default Channels;
