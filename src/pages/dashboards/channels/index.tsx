import { EuiBreadcrumbs, useEuiTheme, useGeneratedHtmlId } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import AdminManagerComponent from "../../../components/admin_manager_component";
import CreateChannelFlyoutContainer from "../../../components/channels/create_channel_flyout_container";
import ChannelsTable from "../../../components/channels/table";
import DashboardLayout from "../../../layouts/dashboard";
import { dashboardsStyles } from "../../../styles/dashboards.styles";

const pathPrefix = process.env.PATH_PREFIX;

const Channels = () => {
  const { euiTheme } = useEuiTheme();
  const router = useRouter();
  const styles = dashboardsStyles(euiTheme);
  const rightSideItemOneId = useGeneratedHtmlId();

  return (
    <>
      <Head>
        <title>Channels</title>
      </Head>
      <AdminManagerComponent page>
        <DashboardLayout
          pageHeader={{
            pageTitle: "Channels",
            iconType: "spacesApp",
            rightSideItems: [<CreateChannelFlyoutContainer key={rightSideItemOneId} />],
          }}
          breadCrumb={
            <EuiBreadcrumbs
              breadcrumbs={[
                {
                  text: "Dashboards",
                  onClick: () => router.push(`${pathPrefix}/dashboards`),
                },
                {
                  text: "Channels",
                },
              ]}
              truncate={false}
            />
          }
        >
          <div css={styles.container}>
            <ChannelsTable />
          </div>
        </DashboardLayout>
      </AdminManagerComponent>
    </>
  );
};

export default Channels;
