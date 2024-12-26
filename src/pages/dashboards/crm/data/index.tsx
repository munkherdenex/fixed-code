import { useGeneratedHtmlId } from "@elastic/eui";
import CreateDataFlyout from "../../../../components/data/create_data_flyout";
import Table from "../../../../components/data/table";
import DashboardCRMLayout from "../../../../layouts/dashboard_crm";

const Data = () => {
  const flyoutId = useGeneratedHtmlId();

  return (
    <DashboardCRMLayout
      pageHeader={{
        pageTitle: "Data",
        rightSideItems: [<CreateDataFlyout key={flyoutId} />],
      }}
    >
      <div>
        <Table />
      </div>
    </DashboardCRMLayout>
  );
};

export default Data;
