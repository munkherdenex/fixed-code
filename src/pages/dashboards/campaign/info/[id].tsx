import { EuiBreadcrumbs, EuiFlexGrid, EuiFlexItem } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import GeneralDetails from "../../../../components/campaign//general_detail";
import Menu from "../../../../components/campaign/menu";
import DashboardLayout from "../../../../layouts/dashboard";

const SendsInfo = () => {
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
                text: "Campaign",
                onClick: () => router.push("/dashboards/campaign"),
              },
              {
                text: "Info",
              },
            ]}
            truncate={false}
            aria-label="Campaign info breadCrumb"
          />
        }
      >
        <>
          <EuiFlexGrid columns={3}>
            <EuiFlexItem>
              <GeneralDetails />
            </EuiFlexItem>
            <EuiFlexItem grow={2}>
              <Menu />
            </EuiFlexItem>
          </EuiFlexGrid>
        </>
      </DashboardLayout>
    </>
  );
};

export default SendsInfo;
