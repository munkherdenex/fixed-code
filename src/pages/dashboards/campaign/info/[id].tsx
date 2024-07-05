import { EuiBreadcrumbs, EuiButton, EuiFlexGrid, EuiFlexItem } from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import GeneralDetails from "../../../../components/campaign//general_detail";
import Menu from "../../../../components/campaign/menu";
import useGetTemplates, { Template } from "../../../../hooks/useGetTemplates";
import useUpdateApproveTemplate from "../../../../hooks/useUpdateApproveTemplate";
import useUpdateDoneTemplate from "../../../../hooks/useUpdateDoneTemplate";
import DashboardLayout from "../../../../layouts/dashboard";
import { globalMutate } from "../../../../utils/globalMutate";

const getRightSideButton = (
  status: string,
  handleStatusButton: (status: string) => void,
  isMutating: boolean,
) => {
  switch (status.toLowerCase()) {
    case "draft":
      return (
        <EuiButton
          isLoading={isMutating}
          color="success"
          onClick={() => handleStatusButton(status)}
          fill
          key="Create-segment"
        >
          Done
        </EuiButton>
      );
    case "done":
      return (
        <EuiButton
          isLoading={isMutating}
          color="primary"
          onClick={() => handleStatusButton(status)}
          fill
          key="Approve-segment"
        >
          Approve
        </EuiButton>
      );
    default:
      return null;
  }
};

const SendsInfo = () => {
  const router = useRouter();
  const { data, isLoading } = useGetTemplates<Template>(router.query.id);
  const { trigger: doneTrigger, isMutating: doneIsMutating } = useUpdateDoneTemplate(
    router.query.id,
  );
  const { trigger: approveTrigger, isMutating: approveIsMutating } = useUpdateApproveTemplate(
    router.query.id,
  );

  const isMutating = doneIsMutating || approveIsMutating;

  const handleStatusButton = async (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        await doneTrigger();
        break;
      case "done":
        await approveTrigger();
        break;
      default:
        break;
    }
    globalMutate("/api/v1/dj/templates/");
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Head>
        <title>Info</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Info",
          iconType: "usersRolesApp",
          rightSideItems: [getRightSideButton(data?.status || "", handleStatusButton, isMutating)],
        }}
        breadCrumb={
          <EuiBreadcrumbs
            breadcrumbs={[
              {
                text: "Dashboards",
                onClick: () => router.push("/dashboards"),
              },
              {
                text: "Campaign",
                onClick: () => router.push("/dashboards/campaign"),
              },
              {
                text: "Info",
              },
            ]}
            truncate={false}
            aria-label="Campaign info breadCrumb"
          />
        }
      >
        <>
          <EuiFlexGrid columns={3}>
            <EuiFlexItem>
              <GeneralDetails />
            </EuiFlexItem>
            <EuiFlexItem grow={2}>
              <Menu />
            </EuiFlexItem>
          </EuiFlexGrid>
        </>
      </DashboardLayout>
    </>
  );
};

export default SendsInfo;
