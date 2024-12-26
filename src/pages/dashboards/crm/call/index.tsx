import { useGeneratedHtmlId } from "@elastic/eui";
import CreateCallFlyout from "../../../../components/call/create_call_flyout";
import Table from "../../../../components/call/table";
import DashboardCRMLayout from "../../../../layouts/dashboard_crm";

const Call = () => {
  const flyoutId = useGeneratedHtmlId();

  return (
    <DashboardCRMLayout
      pageHeader={{
        pageTitle: "Call",
        rightSideItems: [<CreateCallFlyout key={flyoutId} />],
      }}
    >
      <div>
        <Table />
      </div>
    </DashboardCRMLayout>
  );
};

export default Call;
