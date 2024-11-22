import { EuiBreadcrumbs, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import Menu from "../../../../../components/segments/menu";
import GeneralDetails from "../../../../../components/segments/general_details";
import DashboardLayout from "../../../../../layouts/dashboard";
import { SegmentProvider } from "../../../../../store/segment_store";

const Info = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Info</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Segments info",
          iconType: "dashboardApp",
        }}
        breadCrumb={
          <EuiBreadcrumbs
            breadcrumbs={[
              {
                text: "Dashboards",
                onClick: () => router.push("/dashboards/cdp"),
              },
              {
                text: "Segments",
                onClick: () => router.push("/dashboards/cdp/segments"),
              },
              {
                text: "Info",
              },
            ]}
            truncate={false}
            aria-label="Segments info breadCrumb"
          />
        }
      >
        <SegmentProvider>
          <EuiFlexGroup direction="row">
            <EuiFlexItem grow={4}>
              <GeneralDetails />
            </EuiFlexItem>
            <EuiFlexItem grow={7}>
              <Menu />
            </EuiFlexItem>
          </EuiFlexGroup>
        </SegmentProvider>
      </DashboardLayout>
    </>
  );
};

export default Info;
