import { EuiBreadcrumbs } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import GeneralDetails from "../../../../components/channels/general_details";
import DashboardLayout from "../../../../layouts/dashboard";

const ChannelInfo = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Info</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Info",
          iconType: "usersRolesApp",
        }}
        breadCrumb={
          <EuiBreadcrumbs
            breadcrumbs={[
              {
                text: "Dashboards",
                onClick: () => router.push("/dashboards"),
              },
              {
                text: "Channels",
                onClick: () => router.push("/dashboards/channels"),
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
    </>
  );
};

export default ChannelInfo;
