import { EuiButton } from "@elastic/eui";
import { useRouter } from "next/router";
import DashboardCRMLayout from "../../../../../layouts/dashboard_crm";

const FieldTemplate = () => {
  const router = useRouter();

  return (
    <DashboardCRMLayout
      pageHeader={{
        pageTitle: "Field template info",
      }}
    >
      <>info</>
    </DashboardCRMLayout>
  );
};

export default FieldTemplate;
