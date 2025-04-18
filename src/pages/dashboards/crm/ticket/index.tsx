import { EuiButton, useGeneratedHtmlId } from "@elastic/eui";
import CreateTicketFlyout from "../../../../components/ticket/create_ticket_flyout";
import Table from "../../../../components/ticket/table";
import DashboardCRMLayout from "../../../../layouts/dashboard_crm";
import { GetStaticProps } from "next/types";
import { useRouter } from "next/router";

const Ticket = () => {
  const router = useRouter();

  return (
    <DashboardCRMLayout
      pageHeader={{
        pageTitle: "Tickets",
      }}
      rightSideItem={
        <EuiButton
          onClick={() => router.push("/dashboards/crm/ticket/create")}
          iconType="plusInCircleFilled"
          color="danger"
          fill={true}
        >
          Тикет үүсгэх
        </EuiButton>
      }
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
