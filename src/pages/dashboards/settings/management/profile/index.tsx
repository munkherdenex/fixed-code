import Head from "next/head";
import DashboardSettings from "../../../../../layouts/dashboard_settings";
import ManagementProfileTabs from "../../../../../components/management/management_profile_tabs";
import { useContext } from "react";
import { teamsContext } from "../../../../../store/teams_store";
import { GetStaticProps } from "next/types";
import { useTranslations } from "next-intl";

const Management = () => {
  const { teams } = useContext(teamsContext);
  const translate = useTranslations();

  return (
    <>
      <Head>
        <title>Management</title>
      </Head>
      <DashboardSettings
        pageHeader={{
          pageTitle: translate("profile_settings"),
          iconType: "managementApp",
        }}
        hideSidebar={teams?.length === 0}
      >
        <>
          <ManagementProfileTabs />
        </>
      </DashboardSettings>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const teams = (await import(`../../../../../messages/${context.locale}/teams.json`)).default;
  const common = (await import(`../../../../../messages/${context.locale}/common.json`)).default;

  return {
    props: {
      messages: {
        ...teams,
        ...common,
      },
    },
  };
};

export default Management;
