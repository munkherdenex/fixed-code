import { EuiBreadcrumbs, EuiButton } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import CreateTemplateFlyot from "../../../components/campaign/create_template_flyot";
import SendsTable from "../../../components/campaign/table";
import DashboardLayout from "../../../layouts/dashboard";

const pathPrefix = process.env.PATH_PREFIX;

const SendsDashboard = () => {
  const router = useRouter();
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  const closeFlyout = () => {
    setIsFlyoutVisible(false);
  };

  return (
    <>
      <Head>
        <title>Campaign</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Campaign",
          iconType: "spacesApp",
          rightSideItems: [
            <EuiButton
              color="primary"
              onClick={() => setIsFlyoutVisible(true)}
              fill
              key="create-Campaign"
            >
              Create Campaign
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
                text: "Campaign",
              },
            ]}
            truncate={false}
          />
        }
      >
        <div>
          <SendsTable openCreateChannelFlyout={() => setIsFlyoutVisible(true)} />
          {isFlyoutVisible && <CreateTemplateFlyot closeFlyout={closeFlyout} />}
        </div>
      </DashboardLayout>
    </>
  );
};

export default SendsDashboard;
