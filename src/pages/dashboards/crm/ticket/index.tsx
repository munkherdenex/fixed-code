import { useGeneratedHtmlId } from "@elastic/eui";
import CreateTicketFlyout from "../../../../components/ticket/create_ticket_flyout";
import Table from "../../../../components/ticket/table";
import DashboardCRMLayout from "../../../../layouts/dashboard_crm";

const Ticket = () => {
  const flyoutId = useGeneratedHtmlId();

  return (
    <DashboardCRMLayout
      pageHeader={{
        pageTitle: "Tickets",
        rightSideItems: [<CreateTicketFlyout key={flyoutId} />],
      }}
    >
      <div>
        <Table />
      </div>
    </DashboardCRMLayout>
  );
};

export default Ticket;
