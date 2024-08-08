import { EuiBreadcrumbs, EuiSuperSelect } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import CreateTemplateFlyot from "../../../components/campaign/create_template_flyot";
import SendsTable from "../../../components/campaign/table";
import { TEMPLATE_DATA_TYPE_OPTIONS } from "../../../constants";
import DashboardLayout from "../../../layouts/dashboard";

const pathPrefix = process.env.PATH_PREFIX;

const SendsDashboard = () => {
  const router = useRouter();
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const [dataType, setDataType] = useState<any>("");

  const closeFlyout = () => {
    setIsFlyoutVisible(false);
    setDataType("");
  };

  return (
    <>
      <Head>
        <title>Campaign</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Campaign",
          iconType: "spacesApp",
          rightSideItems: [
            <EuiSuperSelect
              key="create-campaign"
              onChange={(value) => {
                setDataType(value);
                setIsFlyoutVisible(true);
              }}
              valueOfSelected={dataType}
              options={TEMPLATE_DATA_TYPE_OPTIONS}
              aria-label="data type"
              aria-placeholder="Create new campaign"
            />,
          ],
        }}
        breadCrumb={
          <EuiBreadcrumbs
            breadcrumbs={[
              {
                text: "Dashboards",
                onClick: () => router.push(`${pathPrefix}/dashboards`),
              },
              {
                text: "Campaign",
              },
            ]}
            truncate={false}
          />
        }
      >
        <div>
          <SendsTable
            createCampaignAction={
              <EuiSuperSelect
                key="create-campaign"
                onChange={(value) => {
                  setDataType(value);
                  setIsFlyoutVisible(true);
                }}
                valueOfSelected={dataType}
                options={TEMPLATE_DATA_TYPE_OPTIONS}
                aria-label="data type"
                aria-placeholder="Create new campaign"
              />
            }
          />
          {isFlyoutVisible && <CreateTemplateFlyot closeFlyout={closeFlyout} dataType={dataType} />}
        </div>
      </DashboardLayout>
    </>
  );
};

export default SendsDashboard;
