import { GetStaticProps } from "next/types";
import TemplateTable from "../../../components/crm/template/table";
import DashboardCRMLayout from "../../../layouts/dashboard_crm";
import { EuiButton } from "@elastic/eui";
import { useRouter } from "next/router";

const CreateTemplateFlyout = () => {
  const router = useRouter();

  return (
    <div>
      <EuiButton key="sdf" onClick={() => router.push("/dashboards/crm/field_template/create")}>
        Create template
      </EuiButton>
    </div>
  );
};

const CRM = () => {
  return (
    <>
      <DashboardCRMLayout
        pageHeader={{
          pageTitle: "Field template",
          rightSideItems: [<CreateTemplateFlyout key="dfgaiogvao" />],
        }}
      >
        <div>
          <TemplateTable />
        </div>
      </DashboardCRMLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const common = (await import(`../../../messages/${context.locale}/common.json`)).default;

  return {
    props: {
      messages: {
        ...common,
      },
    },
  };
};

export default CRM;
