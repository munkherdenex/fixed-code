import { EuiBreadcrumbs, EuiButton } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import SendsTable from "../../../components/sends/table";
import DashboardLayout from "../../../layouts/dashboard";

const pathPrefix = process.env.PATH_PREFIX;

const SendsDashboard = () => {
  const router = useRouter();
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
              onClick={() => router.push(`${pathPrefix}/dashboards/sends/create`)}
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
        </div>
      </DashboardLayout>
    </>
  );
};

export default SendsDashboard;
