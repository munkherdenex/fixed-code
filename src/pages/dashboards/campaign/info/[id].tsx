import {
  EuiBreadcrumbs,
  EuiButton,
  EuiCallOut,
  EuiConfirmModal,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  useGeneratedHtmlId,
} from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import GeneralDetails from "../../../../components/campaign/general_detail";
import Menu from "../../../../components/campaign/menu";
import useGetTemplates, { Template } from "../../../../hooks/useGetTemplates";
import useUpdateApproveTemplate from "../../../../hooks/useUpdateApproveTemplate";
import useUpdateDoneTemplate from "../../../../hooks/useUpdateDoneTemplate";
import DashboardLayout from "../../../../layouts/dashboard";
import { teamsContext } from "../../../../store/teams_store";
import { globalMutate } from "../../../../utils/globalMutate";
import EmailGeneralDetails from "../../../../components/campaign/email_general_detail";

const getRightSideButton = (
  status: string,
  role: string,
  handleStatusButton: () => void,
  isMutating: boolean,
) => {
  switch (status.toLowerCase()) {
    case "draft":
      return (
        <EuiButton
          isLoading={isMutating}
          color="success"
          onClick={handleStatusButton}
          fill
          key="Create-segment"
        >
          Done
        </EuiButton>
      );
    case "done":
      if (role === "admin" || role === "manager") {
        return (
          <EuiButton
            isLoading={isMutating}
            color="primary"
            onClick={handleStatusButton}
            fill
            key="Approve-segment"
          >
            Approve
          </EuiButton>
        );
      }
      break;
    default:
      return null;
  }
};

const CampaignInfo = () => {
  const router = useRouter();
  const { myProfile } = useContext(teamsContext);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data, isLoading } = useGetTemplates<Template>(router.query.id);
  const { trigger: doneTrigger, isMutating: doneIsMutating } = useUpdateDoneTemplate(
    router.query.id,
  );
  const { trigger: approveTrigger, isMutating: approveIsMutating } = useUpdateApproveTemplate(
    router.query.id,
  );

  const closeModal = () => setIsModalVisible(false);
  const showModal = () => setIsModalVisible(true);

  const modalTitleId = useGeneratedHtmlId();

  const isMutating = doneIsMutating || approveIsMutating;

  const handleStatusButton = async () => {
    showModal();
  };

  const handleModelConfirm = async () => {
    let response: any;
    switch (data.status.toLowerCase()) {
      case "draft":
        response = await doneTrigger();
        break;
      case "done":
        response = await approveTrigger();
        break;
      default:
        break;
    }
    if (response) {
      closeModal();
      globalMutate("/api/v1/dj/templates/");
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Head>
        <title>Info</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Campaign info",
          iconType: "spacesApp",
          rightSideItems: [
            getRightSideButton(data?.status || "", myProfile?.role, handleStatusButton, isMutating),
          ],
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
          {
            data?.kind === 'email' ?
              <>
                <>
                  <EuiFlexItem grow={4}>
                    <EmailGeneralDetails templateStatus={data?.status} />
                  </EuiFlexItem>
                  <EuiSpacer size="l" />
                  <EuiFlexItem grow={7}>
                    <Menu isEmail={true} />
                  </EuiFlexItem>
                </>
              </> :
              <EuiFlexGroup>
                <EuiFlexItem grow={4}>
                  <GeneralDetails templateStatus={data?.status} />
                </EuiFlexItem>
                <EuiFlexItem grow={7}>
                  <Menu isEmail={false} />
                </EuiFlexItem>
              </EuiFlexGroup>
          }
          {isModalVisible && data.status === "DRAFT" && (
            <EuiConfirmModal
              aria-labelledby={modalTitleId}
              style={{ width: 600 }}
              title="Update campaign"
              onCancel={closeModal}
              onConfirm={handleModelConfirm}
              confirmButtonDisabled={data?.aud_count === 0}
              cancelButtonText="Cancel"
              confirmButtonText="Confirm"
              defaultFocusedButton={data?.aud_count === 0 ? "cancel" : "confirm"}
            >
              <EuiCallOut title="Warning" color="warning" iconType="warning">
                <p>Audience must be added to the campaign before marking it as done.</p>
              </EuiCallOut>
              <EuiSpacer />
              <p>
                The campaign will be marked as done, and it has reached an audience of{" "}
                <strong>{data?.aud_count}</strong>. Are you sure you want to continue?
              </p>
            </EuiConfirmModal>
          )}
          {isModalVisible && data.status === "DONE" && (
            <EuiConfirmModal
              aria-labelledby={modalTitleId}
              style={{ width: 600 }}
              title="Update campaign"
              onCancel={closeModal}
              onConfirm={handleModelConfirm}
              cancelButtonText="Cancel"
              confirmButtonText="Confirm"
              defaultFocusedButton="confirm"
            >
              <p>
                The campaign will be marked as approved, and it has reached an audience of{" "}
                <strong>{data?.aud_count}</strong>. Are you sure you want to continue?
              </p>
            </EuiConfirmModal>
          )}
        </>
      </DashboardLayout>
    </>
  );
};

export default CampaignInfo;
