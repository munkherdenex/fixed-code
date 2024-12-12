import { useGeneratedHtmlId } from "@elastic/eui";
import { useTranslations } from "next-intl";
import Head from "next/head";
import { GetStaticProps } from "next/types";
import AdminManagerComponent from "../../../../components/admin_manager_component";
import CreateFieldFlyoutContainer from "../../../../components/custom_attribute/create_field_flyout_container";
import FieldsTable from "../../../../components/custom_attribute/table";
import DashboardLayout from "../../../../layouts/dashboard";

const CustomFields = () => {
  const createFieldFlyoutContainerId = useGeneratedHtmlId();
  const translate = useTranslations();

  return (
    <>
      <Head>
        <title>{translate("custom_attribute")}</title>
      </Head>
      <AdminManagerComponent page>
        <DashboardLayout
          pageHeader={{
            pageTitle: translate("custom_attribute"),
            iconType: "usersRolesApp",
            rightSideItems: [<CreateFieldFlyoutContainer key={createFieldFlyoutContainerId} />],
          }}
        >
          <div>
            <FieldsTable />
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

export default CustomFields;
