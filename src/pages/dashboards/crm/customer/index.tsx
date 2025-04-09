import DashboardCRMLayout from "../../../../layouts/dashboard_crm";
import CustomersTable from "../../../../components/customers/table";
import { GetStaticProps } from "next/types";
import { EuiButton } from "@elastic/eui";

const Data = () => {
  return (
    <DashboardCRMLayout
      pageHeader={{
        pageTitle: "Хэрэглэгчийн түүх",
        rightSideItems: [
          <EuiButton
            key="import btn"
            fill
            color="danger"
            iconType="plusInCircleFilled"
            onClick={() => {}}
          >
            Хэрэглэгч бүртгэх
          </EuiButton>,
          <EuiButton key="add key" color="danger" onClick={() => {}}>
            Импорт хийх
          </EuiButton>,
        ],
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
