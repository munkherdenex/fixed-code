import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { useTranslations } from "next-intl";
import Head from "next/head";
import { useRouter } from "next/router";
import GeneralDetails from "../../../../../components/customers/general_details";
import Overview from "../../../../../components/customers/overview";
import Total from "../../../../../components/customers/total";
import DashboardLayout from "../../../../../layouts/dashboard";
import { AudienceProvider } from "../../../../../store/audience_store";
import { GetStaticProps } from "next/types";

const Info = () => {
  const router = useRouter();
  const translate = useTranslations();

  return (
    <>
      <Head>
        <title>{translate("audience-info-details")}</title>
      </Head>
      <AudienceProvider>
        <DashboardLayout
          pageHeader={{
            pageTitle: translate("audience-info-details"),
          }}
          breadCrumb={[
            {
              text: (
                <>
                  <EuiButtonIcon
                    display="base"
                    iconType="arrowLeft"
                    size="s"
                    color="text"
                    aria-label="back"
                  />
                </>
              ),
              color: "primary",
              "aria-current": false,
              onClick: () => router.back(),
            },
            {
              text: "Хэрэглэгчийн түүх",
              onClick: () => router.push("/dashboards/cdp/audience?phone="),
            },
            {
              text: "Хэрэглэгчийн түүх дэлгэрэнгүй",
            },
          ]}
        >
          <>
            <EuiFlexGroup>
              <EuiFlexItem grow={4}>
                <GeneralDetails />
              </EuiFlexItem>
              <EuiFlexItem grow={7}>
                <EuiFlexGroup direction="column">
                  <EuiFlexItem grow={false}>
                    <Total />
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <Overview />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </>
        </DashboardLayout>
      </AudienceProvider>
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
  const audience = (await import(`../../../../../messages/${context.locale}/audience.json`))
    .default;
  const common = (await import(`../../../../../messages/${context.locale}/common.json`)).default;
  return {
    props: {
      messages: {
        ...audience,
        ...common,
      },
    },
  };
};

export default Info;
