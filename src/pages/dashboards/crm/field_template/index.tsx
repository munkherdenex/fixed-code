import { EuiButton } from "@elastic/eui";
import { useRouter } from "next/router";
import DashboardCRMLayout from "../../../../layouts/dashboard_crm";
import Table from "../../../../components/crm/field_template/table";

const FieldTemplate = () => {
  const router = useRouter();

  return (
    <DashboardCRMLayout
      pageHeader={{
        pageTitle: "Field template",
        rightSideItems: [
          <EuiButton key="sdf" onClick={() => router.push("/dashboards/crm/field_template/create")}>
            Create template
          </EuiButton>,
        ],
      }}
    >
      <>
        <Table />
      </>
    </DashboardCRMLayout>
  );
};

export default FieldTemplate;
