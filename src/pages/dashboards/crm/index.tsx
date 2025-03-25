import { GetStaticProps } from "next/types";
import DashboardCRMLayout from "../../../layouts/dashboard_crm";
import { EuiText } from '@elastic/eui';

const CRM = () => {
  return (
    <>
      <DashboardCRMLayout
        pageHeader={{
          pageTitle: "CRM dashboard",
        }}
      >
        <div>
          <EuiText>
            <h3>Энэ хэсэгт харуулах зүйлс</h3>

            <ul>
              <li>Нээлттэй тикетүүд</li>
              <li>Дуудлагын түүх</li>
              <li>Чатны түүх</li>
            </ul>
          </EuiText>
        </div>
      </DashboardCRMLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const common = (await import(`../../../messages/${context.locale}/common.json`)).default;
  const campaign = (await import(`../../../messages/${context.locale}/campaign.json`)).default;

  return {
    props: {
      messages: {
        ...common,
        ...campaign,
      },
    },
  };
};

export default CRM;
