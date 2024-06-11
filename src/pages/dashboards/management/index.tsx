import Head from "next/head";
import Sidebar from "../../../components/management/sidebar";
import TeamMembersComponent from "../../../components/management/team_members";
import DashboardLayout from "../../../layouts/dashboard";

const Management = () => {
  return (
    <>
      <Head>
        <title>Management</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Team members",
          iconType: "managementApp",
        }}
        sidebar={<Sidebar active="teamMembers" />}
      >
        <TeamMembersComponent />
      </DashboardLayout>
    </>
  );
};

export default Management;
