import { EuiBreadcrumbs, EuiButton } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import CreateTemplateFlyot from "../../../components/sends/create_template_flyot";
import SendsTable from "../../../components/sends/table";
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
        <title>Sends</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Sends",
          iconType: "spacesApp",
          rightSideItems: [
            <EuiButton
              color="primary"
              onClick={() => setIsFlyoutVisible(true)}
              fill
              key="create-sends"
            >
              Create sends
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
                text: "Sends",
              },
            ]}
            truncate={false}
          />
        }
      >
        <div>
          <SendsTable />
          {isFlyoutVisible && <CreateTemplateFlyot closeFlyout={closeFlyout} />}
        </div>
      </DashboardLayout>
    </>
  );
};

export default SendsDashboard;
