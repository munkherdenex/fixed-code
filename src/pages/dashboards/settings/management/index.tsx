import { EuiButton } from "@elastic/eui";
import { useTranslations } from "next-intl";
import Head from "next/head";
import { useRouter } from "next/router";
import { GetStaticProps } from "next/types";
import TeamsTable from "../../../../components/management/teams_table";
import { IS_POCKET } from "../../../../constants";
import DashboardSettings from "../../../../layouts/dashboard_settings";

const Management = () => {
  const router = useRouter();
  const translate = useTranslations();

  return (
    <>
      <Head>
        <title>{translate("teams")}</title>
      </Head>
      <DashboardSettings
        pageHeader={{
          pageTitle: translate("teams"),
          iconType: "managementApp",
          rightSideItems: [
            !IS_POCKET && (
              <EuiButton
                color="primary"
                key="create-team-button"
                fill
                onClick={() => router.push("/dashboards/settings/team/create")}
              >
                {translate("create_team")}
              </EuiButton>
            ),
          ],
        }}
      >
        <TeamsTable />
      </DashboardSettings>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const teams = (await import(`../../../../messages/${context.locale}/teams.json`)).default;
  const common = (await import(`../../../../messages/${context.locale}/common.json`)).default;

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
