import { EuiBreadcrumbs, EuiFlexGroup, EuiFlexItem, EuiPanel } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import GeneralDetails from "../../../../components/segments/general_details";
import SegmentCustomerList from "../../../../components/segments/segment_customer_list";
import DashboardLayout from "../../../../layouts/dashboard";

const Info = () => {
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
                text: "Segments",
                onClick: () => router.push("/dashboards/segments"),
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
        <>
          <EuiFlexGroup>
            <EuiFlexItem>
              <GeneralDetails />
            </EuiFlexItem>
            <EuiFlexItem>
              <SegmentCustomerList />
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
      </DashboardLayout>
    </>
  );
};

export default Info;
