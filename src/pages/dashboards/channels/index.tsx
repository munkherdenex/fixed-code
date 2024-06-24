import { EuiBreadcrumbs, EuiButton, useEuiTheme } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import CreateChannelFlyout from "../../../components/channels/create_channel_flyot";
import ChannelsTable from "../../../components/channels/table";
import DashboardLayout from "../../../layouts/dashboard";
import { dashboardsStyles } from "../../../styles/dashboards.styles";

const pathPrefix = process.env.PATH_PREFIX;

const Channels = () => {
  const { euiTheme } = useEuiTheme();
  const router = useRouter();
  const styles = dashboardsStyles(euiTheme);
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  const closeFlyout = () => {
    setIsFlyoutVisible(false);
  };

  return (
    <>
      <Head>
        <title>Channels</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Channels",
          iconType: "spacesApp",
          rightSideItems: [
            <EuiButton
              color="primary"
              onClick={() => setIsFlyoutVisible(true)}
              fill
              key="create-channels"
            >
              Create channels
            </EuiButton>,
          ],
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
          {isFlyoutVisible && <CreateChannelFlyout closeFlyout={closeFlyout} />}
        </div>
      </DashboardLayout>
    </>
  );
};

export default Channels;
