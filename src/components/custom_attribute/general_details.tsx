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
import useDeleteField from "../../hooks/useDeleteCustomField";
import useGetFields, { Fields } from "../../hooks/useGetFields";
import UpdateFieldFlyout from "./edit_field_flyout";

const DeleteConfirmModal = ({
  setIsModalVisible,
}: {
  setIsModalVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const modalTitleId = useGeneratedHtmlId();
  const { trigger, isMutating } = useDeleteField(router.query.id);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");

  const closeModal = async () => {
    setIsModalVisible(false);
  };

  const confirmModal = async () => {
    const response = await trigger();
    if (response) {
      await router.replace("/dashboards/custom_attribute");
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
      title="Delete custom attribute?"
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
  const { data, isLoading } = useGetFields<Fields>(router.query.id);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditFlyoutVisible, setIsEditFlyoutVisible] = useState(false);

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
              <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
                <EuiFlexItem grow={false}>
                  <strong>Custom attribute details</strong>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiFlexGroup gutterSize="s">
                    <EuiFlexItem grow={false}>
                      <EuiButtonIcon
                        display="base"
                        iconType="pencil"
                        aria-label="Update"
                        color="primary"
                        onClick={() => setIsEditFlyoutVisible(true)}
                      />
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiButtonIcon
                        display="base"
                        iconType="trash"
                        aria-label="Delete"
                        color="danger"
                        onClick={() => setIsModalVisible(true)}
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGrid columns={2}>
              <EuiFlexItem>Name:</EuiFlexItem>
              <EuiFlexItem>{data?.name}</EuiFlexItem>
              <EuiHorizontalRule margin="none" />
              <EuiFlexItem>Attribute name:</EuiFlexItem>
              <EuiFlexItem>{data?.attribute_name}</EuiFlexItem>
              <EuiHorizontalRule margin="none" />
              <EuiFlexItem>Data type:</EuiFlexItem>
              <EuiFlexItem>
                <div>
                  <EuiBadge>{data?.data_type}</EuiBadge>
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
      {isEditFlyoutVisible && (
        <UpdateFieldFlyout setIsFlyoutVisible={setIsEditFlyoutVisible} data={data} />
      )}
    </div>
  );
};

export default GeneralDetails;
