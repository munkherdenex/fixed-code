import { useGeneratedHtmlId } from "@elastic/eui";
import { useTranslations } from "next-intl";
import Head from "next/head";
import { GetStaticProps } from "next/types";
import AdminManagerComponent from "../../../../components/admin_manager_component";
import CreateFieldFlyoutContainer from "../../../../components/custom_attribute/create_field_flyout_container";
import DashboardLayout from "../../../../layouts/dashboard";
import TesterCustomersTable from '../../../../components/customers/tester_table';

const TestUsers = () => {
  const createFieldFlyoutContainerId = useGeneratedHtmlId();
  const translate = useTranslations();

  return (
    <>
      <Head>
        <title>{translate("test_users")}</title>
      </Head>
      <AdminManagerComponent page>
        <DashboardLayout
          pageHeader={{
            pageTitle: translate("test_users"),
            iconType: "usersRolesApp"
          }}
        >
          <div>
            <TesterCustomersTable />
          </div>
        </DashboardLayout>
      </AdminManagerComponent>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const custom = (await import(`../../../../messages/${context.locale}/custom.json`)).default;
  const common = (await import(`../../../../messages/${context.locale}/common.json`)).default;

  return {
    props: {
      messages: {
        ...custom,
        ...common,
      },
    },
  };
};

export default TestUsers;
