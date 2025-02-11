import { EuiButton } from "@elastic/eui";
import { useRouter } from "next/router";
import DashboardCRMLayout from "../../../../layouts/dashboard_crm";
import Table from "../../../../components/crm/field_template/table";
import { GetStaticProps } from 'next/types';

const KnowledgeBase = () => {
  const router = useRouter();

  return (
    <DashboardCRMLayout
      pageHeader={{
        pageTitle: "Мэдлэгийн сан",
        rightSideItems: [
          <EuiButton key="sdf" onClick={() => router.push("/dashboards/crm/knowledge_base/create")}>
            Үүсгэх
          </EuiButton>,
        ],
      }}
    >
      <>
        <Table />
      </>
    </DashboardCRMLayout>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const common = (await import(`../../../../messages/${context.locale}/common.json`)).default;
  const knowledge = (await import(`../../../../messages/${context.locale}/knowledge.json`)).default;

  return {
    props: {
      messages: {
        ...common,
        ...knowledge,
      },
    },
  };
};

export default KnowledgeBase;
