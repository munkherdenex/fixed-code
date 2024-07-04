import { EuiBreadcrumbs, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import GeneralDetails from "../../../../components/customers/general_details";
import Overview from "../../../../components/customers/overview";
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
                text: "Audience",
                onClick: () => router.push("/dashboards/audience"),
              },
              {
                text: "Info",
              },
            ]}
            truncate={false}
            aria-label="Audience info breadCrumb"
          />
        }
      >
        <>
          <EuiFlexGroup>
            <EuiFlexItem>
              <GeneralDetails />
            </EuiFlexItem>
            <EuiFlexItem>
              <Overview />
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
      </DashboardLayout>
    </>
  );
};

export default Info;
