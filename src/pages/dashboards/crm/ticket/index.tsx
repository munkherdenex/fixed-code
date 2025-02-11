import { useGeneratedHtmlId } from "@elastic/eui";
import CreateTicketFlyout from "../../../../components/ticket/create_ticket_flyout";
import Table from "../../../../components/ticket/table";
import DashboardCRMLayout from "../../../../layouts/dashboard_crm";
import { GetStaticProps } from 'next/types';

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

export const getStaticProps: GetStaticProps = async (context) => {
  const common = (await import(`../../../../messages/${context.locale}/common.json`)).default;
  const ticket = (await import(`../../../../messages/${context.locale}/ticket.json`)).default;

  return {
    props: {
      messages: {
        ...common,
        ...ticket,
      },
    },
  };
};

export default Ticket;
