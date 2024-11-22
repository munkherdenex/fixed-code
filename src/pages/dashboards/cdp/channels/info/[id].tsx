import { EuiBreadcrumbs } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import AdminManagerComponent from "../../../../../components/admin_manager_component";
import GeneralDetails from "../../../../../components/channels/general_details";
import DashboardLayout from "../../../../../layouts/dashboard";

const ChannelInfo = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Info</title>
      </Head>
      <AdminManagerComponent page>
        <DashboardLayout
          pageHeader={{
            pageTitle: "Channel info",
            iconType: "spacesApp",
          }}
          breadCrumb={
            <EuiBreadcrumbs
              breadcrumbs={[
                {
                  text: "Dashboards",
                  onClick: () => router.push("/dashboards/cdp"),
                },
                {
                  text: "Channels",
                  onClick: () => router.push("/dashboards/cdp/channels"),
                },
                {
                  text: "Info",
                },
              ]}
              truncate={false}
              aria-label="Channels info breadCrumb"
            />
          }
        >
          <>
            <GeneralDetails />
          </>
        </DashboardLayout>
      </AdminManagerComponent>
    </>
  );
};

export default ChannelInfo;
