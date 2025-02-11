import { useGeneratedHtmlId } from "@elastic/eui";
import CreateCallFlyout from "../../../../components/call/create_call_flyout";
import Table from "../../../../components/call/table";
import DashboardCRMLayout from "../../../../layouts/dashboard_crm";
import { GetStaticProps } from 'next/types';

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

export const getStaticProps: GetStaticProps = async (context) => {
  const common = (await import(`../../../../messages/${context.locale}/common.json`)).default;
  const campaign = (await import(`../../../../messages/${context.locale}/campaign.json`)).default;

  return {
    props: {
      messages: {
        ...common,
        ...campaign,
      },
    },
  };
};

export default Call;
