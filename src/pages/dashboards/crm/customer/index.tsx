import DashboardCRMLayout from "../../../../layouts/dashboard_crm";
import CustomersTable from '../../../../components/customers/table';
import { GetStaticProps } from 'next/types';

const Data = () => {
  return (
    <DashboardCRMLayout
      pageHeader={{
        pageTitle: "Харилцагчид",
      }}
    >
      <div>
        <CustomersTable />
      </div>
    </DashboardCRMLayout>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const common = (await import(`../../../../messages/${context.locale}/common.json`)).default;
  const audience = (await import(`../../../../messages/${context.locale}/audience.json`)).default;

  return {
    props: {
      messages: {
        ...common,
        ...audience,
      },
    },
  };
};

export default Data;
