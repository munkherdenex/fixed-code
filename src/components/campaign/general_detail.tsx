import {
  EuiBadge,
  EuiButton,
  EuiButtonIcon,
  EuiCallOut,
  EuiCodeBlock,
  EuiConfirmModal,
  EuiFieldText,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiPanel,
  EuiSpacer,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { jsonrepair } from "jsonrepair";
import moment from "moment";
import { useRouter } from "next/router";
import { SetStateAction, useState } from "react";
import useDeleteTemplate from "../../hooks/useDeleteTemplate";
import useGetTemplates, { Template } from "../../hooks/useGetTemplates";
import { badgeColor } from "../../utils/badge_color";
import EditTemplateFlyout from "./edit_template_flyout";
import { quillEditorStyles } from "./quill_editor.styles";

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
      await router.replace("/dashboards/campaign");
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
      <EuiCallOut title="Proceed with caution!" color="warning" iconType="warning">
        <p>
          You are about to delete this campaign. This is a destructive action and cannot be undone.
          Are you sure you want to proceed?
        </p>
      </EuiCallOut>
      <EuiSpacer />
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

const GeneralDetails = ({
  templateStatus,
}: {
  templateStatus?: "DRAFT" | "APPROVED" | "PUBLISHED" | "DONE" | "ERROR";
}) => {
  const router = useRouter();
  const modalTitleId = useGeneratedHtmlId();

  const { data, isLoading } = useGetTemplates<Template>(
    router.query.id,
    {},
    {
      refreshInterval: templateStatus !== "DRAFT" ? 1000 : 0,
    },
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditFlyoutVisible, setIsEditFlyoutVisible] = useState(false);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);

  const closeEmailModal = () => setIsEmailModalVisible(false);
  const showEmailModal = () => setIsEmailModalVisible(true);
  const styles = quillEditorStyles();

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
              <EuiFlexItem>Kind:</EuiFlexItem>
              <EuiFlexItem>
                <div>
                  <EuiBadge color={badgeColor(data.kind)}>{data.kind}</EuiBadge>
                </div>
              </EuiFlexItem>
              <EuiFlexItem>Body:</EuiFlexItem>
              <EuiFlexItem>
                {data?.kind === "email" && (
                  <>
                    <EuiButton onClick={showEmailModal} size="s">
                      Preview
                    </EuiButton>
                    {isEmailModalVisible && (
                      <EuiModal
                        style={{ width: 800, height: 600 }}
                        aria-labelledby={modalTitleId}
                        onClose={closeEmailModal}
                      >
                        <EuiModalHeader>
                          <EuiModalHeaderTitle id={modalTitleId}></EuiModalHeaderTitle>
                        </EuiModalHeader>
                        <EuiModalBody>
                          <iframe srcDoc={data?.body} css={styles.iframe} />
                        </EuiModalBody>
                        <EuiModalFooter>
                          <EuiButton onClick={closeEmailModal} fill>
                            Close
                          </EuiButton>
                        </EuiModalFooter>
                      </EuiModal>
                    )}
                  </>
                )}
                {data?.kind === "api" && (
                  <EuiCodeBlock
                    language="json"
                    fontSize="s"
                    paddingSize="s"
                    isCopyable
                    overflowHeight={300}
                  >
                    <pre>{JSON.stringify(JSON.parse(jsonrepair(data?.body)), null, 2)}</pre>
                  </EuiCodeBlock>
                )}
              </EuiFlexItem>
              <EuiFlexItem>Status:</EuiFlexItem>
              <EuiFlexItem>
                <div>
                  <EuiBadge color={badgeColor(data.status)}>{data.status}</EuiBadge>
                </div>
              </EuiFlexItem>
              <EuiFlexItem>Created date :</EuiFlexItem>
              <EuiFlexItem>{moment(data?.created_at).format("YYYY-MM-DD LT")}</EuiFlexItem>
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
