import {
  EuiBadge,
  EuiButtonIcon,
  EuiConfirmModal,
  EuiFieldText,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiHorizontalRule,
  EuiPanel,
  useGeneratedHtmlId,
} from "@elastic/eui";
import moment from "moment";
import { useRouter } from "next/router";
import { SetStateAction, useState } from "react";
import useDeleteTemplate from "../../hooks/useDeleteTemplate";
import useGetTemplates, { Template } from "../../hooks/useGetTemplates";
import EditTemplateFlyout from "./edit_template_flyout";

const DeleteConfirmModal = ({
  setIsModalVisible,
}: {
  setIsModalVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const modalTitleId = useGeneratedHtmlId();
  const { trigger, isMutating } = useDeleteTemplate(router.query.id);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");

  const closeModal = async () => {
    setIsModalVisible(false);
  };

  const confirmModal = async () => {
    const response = await trigger();
    if (response) {
      await router.replace("/dashboards/Campaign");
      setIsModalVisible(false);
      setDeleteConfirmValue("");
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeleteConfirmValue(e.target.value);
  };

  return (
    <EuiConfirmModal
      aria-labelledby={modalTitleId}
      title="Delete send?"
      onCancel={closeModal}
      onConfirm={() => {
        confirmModal();
      }}
      confirmButtonText="Delete"
      cancelButtonText="Cancel"
      buttonColor="danger"
      isLoading={isMutating}
      confirmButtonDisabled={deleteConfirmValue.toLowerCase() !== "delete"}
    >
      <EuiFormRow label="Type the word 'delete' to confirm">
        <EuiFieldText
          isLoading={isMutating}
          name="delete"
          value={deleteConfirmValue}
          onChange={onChange}
        />
      </EuiFormRow>
    </EuiConfirmModal>
  );
};

const GeneralDetails = () => {
  const router = useRouter();
  const { data, isLoading } = useGetTemplates<Template>(router.query.id);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditFlyoutVisible, setIsEditFlyoutVisible] = useState(false);

  const closeFlyout = () => {
    setIsEditFlyoutVisible(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  return (
    <div>
      <EuiPanel>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <EuiPanel paddingSize="s" color="subdued">
              <EuiFlexGroup responsive={false} alignItems="center" justifyContent="spaceBetween">
                <EuiFlexItem grow={false}>
                  <strong>Send info details</strong>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiFlexGroup responsive={false} gutterSize="s">
                    {(data.status === "DRAFT" || data.status === "ERROR") && (
                      <EuiFlexItem grow={false}>
                        <EuiButtonIcon
                          display="base"
                          iconType="pencil"
                          aria-label="Update"
                          color="primary"
                          onClick={() => setIsEditFlyoutVisible(true)}
                        />
                      </EuiFlexItem>
                    )}
                    {data.status !== "APPROVED" && data.status !== "PUBLISHED" && (
                      <EuiFlexItem grow={false}>
                        <EuiButtonIcon
                          display="base"
                          iconType="trash"
                          aria-label="Delete"
                          color="danger"
                          onClick={() => setIsModalVisible(true)}
                        />
                      </EuiFlexItem>
                    )}
                  </EuiFlexGroup>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGrid columns={2} responsive={false}>
              <EuiFlexItem>Title:</EuiFlexItem>
              <EuiFlexItem>{data.title}</EuiFlexItem>
              <EuiHorizontalRule margin="none" />
              <EuiFlexItem>Kind:</EuiFlexItem>
              <EuiFlexItem>{data.kind}</EuiFlexItem>
              <EuiHorizontalRule margin="none" />
              <EuiFlexItem>Body:</EuiFlexItem>
              <EuiFlexItem>{data.body}</EuiFlexItem>
              <EuiHorizontalRule margin="none" />
              <EuiFlexItem>Status:</EuiFlexItem>
              <EuiFlexItem>
                <div>
                  <EuiBadge>{data.status}</EuiBadge>
                </div>
              </EuiFlexItem>
              <EuiHorizontalRule margin="none" />
              <EuiFlexItem>Created date :</EuiFlexItem>
              <EuiFlexItem>{moment(data?.created_at).format("YYYY-MM-DD LT")}</EuiFlexItem>
              <EuiHorizontalRule margin="none" />
              <EuiFlexItem>Updated date :</EuiFlexItem>
              <EuiFlexItem>{moment(data?.updated_at).format("YYYY-MM-DD LT")}</EuiFlexItem>
            </EuiFlexGrid>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
      {isModalVisible && <DeleteConfirmModal setIsModalVisible={setIsModalVisible} />}
      {isEditFlyoutVisible && <EditTemplateFlyout closeFlyout={closeFlyout} data={data} />}
    </div>
  );
};

export default GeneralDetails;
