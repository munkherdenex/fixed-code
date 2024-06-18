import { EuiBreadcrumbs } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
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
          <div>a</div>
        </>
      </DashboardLayout>
    </>
  );
};

export default Info;
