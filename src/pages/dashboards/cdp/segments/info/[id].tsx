import { EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { useTranslations } from "next-intl";
import Head from "next/head";
import { GetStaticProps } from "next/types";
import GeneralDetails from "../../../../../components/segments/general_details";
import Menu from "../../../../../components/segments/menu";
import DashboardLayout from "../../../../../layouts/dashboard";
import { SegmentProvider } from "../../../../../store/segment_store";

const Info = () => {
  const translate = useTranslations();

  return (
    <>
      <Head>
        <title>{translate("segment_info")}</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: translate("segment_info"),
          iconType: "dashboardApp",
        }}
      >
        <SegmentProvider>
          <EuiFlexGroup direction="row">
            <EuiFlexItem grow={4}>
              <GeneralDetails />
            </EuiFlexItem>
            <EuiFlexItem grow={7}>
              <Menu />
            </EuiFlexItem>
          </EuiFlexGroup>
        </SegmentProvider>
      </DashboardLayout>
    </>
  );
};

export async function getStaticPaths() {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
}

export const getStaticProps: GetStaticProps = async (context) => {
  const segments = (await import(`../../../../../messages/${context.locale}/segments.json`))
    .default;
  const common = (await import(`../../../../../messages/${context.locale}/common.json`)).default;

  return {
    props: {
      messages: {
        ...segments,
        ...common,
      },
    },
  };
};

export default Info;
