import { EuiBreadcrumbs, EuiFlexGrid, EuiFlexItem } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import GeneralDetails from "../../../../components/sends/general_detail";
import Menu from "../../../../components/sends/menu";
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
                text: "Sends",
                onClick: () => router.push("/dashboards/sends"),
              },
              {
                text: "Info",
              },
            ]}
            truncate={false}
            aria-label="Sends info breadCrumb"
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
