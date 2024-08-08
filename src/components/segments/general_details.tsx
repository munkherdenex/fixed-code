import {
  EuiBadge,
  EuiButtonIcon,
  EuiCallOut,
  EuiCodeBlock,
  EuiConfirmModal,
  EuiFieldText,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFormRow,
  EuiPanel,
  EuiSpacer,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { jsonrepair } from "jsonrepair";
import moment from "moment";
import { useRouter } from "next/router";
import { SetStateAction, useState } from "react";
import useDeleteSegment from "../../hooks/useDeleteSegment";
import useGetSegments, { Segment } from "../../hooks/useGetSegments";
import { badgeColor } from "../../utils/badge_color";
import EditDynamic from "./edit_dynamic";
import Manual from "./manual";

const DeleteConfirmModal = ({
  setIsModalVisible,
}: {
  setIsModalVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const modalTitleId = useGeneratedHtmlId();
  const { trigger, isMutating } = useDeleteSegment(router.query.id);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");

  const closeModal = async () => {
    setIsModalVisible(false);
  };

  const confirmModal = async () => {
    const response = await trigger();
    if (response) {
      await router.replace("/dashboards/segments");
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
        <p>This action cannot be undone. This will permanently delete the segment.</p>
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

const GeneralDetails = () => {
  const router = useRouter();
  const { data, isLoading } = useGetSegments<Segment>(router.query.id);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [openFlyout, setOpenFlyout] = useState(false);

  const flyoutTitleId = useGeneratedHtmlId({
    prefix: "flyoutTitle",
  });

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
                  <strong>Segment details</strong>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiFlexGroup responsive={false} gutterSize="s">
                    {(data.type === "dynamic" || data.type === "static") && (
                      <EuiFlexItem grow={false}>
                        <EuiButtonIcon
                          display="base"
                          iconType="pencil"
                          aria-label="Update"
                          color="primary"
                          onClick={() => setOpenFlyout(true)}
                        />
                      </EuiFlexItem>
                    )}
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
            <EuiFlexGrid columns={2} responsive={false}>
              <EuiFlexItem>Name:</EuiFlexItem>
              <EuiFlexItem>{data?.name}</EuiFlexItem>
              <EuiFlexItem>Description:</EuiFlexItem>
              <EuiFlexItem>{data?.description}</EuiFlexItem>
              <EuiFlexItem>Status:</EuiFlexItem>
              <EuiFlexItem>
                <div>
                  <EuiBadge color={badgeColor(data?.status)}>{data?.status}</EuiBadge>
                </div>
              </EuiFlexItem>
              <EuiFlexItem>Type:</EuiFlexItem>
              <EuiFlexItem>
                <div>
                  <EuiBadge color={badgeColor(data?.type)}>{data?.type}</EuiBadge>
                </div>
              </EuiFlexItem>
              {(data.type === "dynamic" || data.type === "static") && (
                <>
                  <EuiFlexItem>Condition:</EuiFlexItem>
                  <EuiFlexItem>
                    <EuiCodeBlock
                      language="json"
                      fontSize="s"
                      paddingSize="s"
                      isCopyable
                      overflowHeight={300}
                    >
                      <pre>{JSON.stringify(JSON.parse(jsonrepair(data?.condition)), null, 2)}</pre>
                    </EuiCodeBlock>
                  </EuiFlexItem>
                </>
              )}
              <EuiFlexItem>Created by :</EuiFlexItem>
              <EuiFlexItem>{data?.created_by}</EuiFlexItem>
              <EuiFlexItem>Created date :</EuiFlexItem>
              <EuiFlexItem>{moment(data?.created_at).format("YYYY-MM-DD LT")}</EuiFlexItem>
              <EuiFlexItem>Updated date :</EuiFlexItem>
              <EuiFlexItem>{moment(data?.updated_at).format("YYYY-MM-DD LT")}</EuiFlexItem>
            </EuiFlexGrid>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
      {isModalVisible && <DeleteConfirmModal setIsModalVisible={setIsModalVisible} />}
      {openFlyout && (
        <EuiFlyout onClose={() => setOpenFlyout(false)}>
          <EuiFlyoutHeader hasBorder aria-labelledby={flyoutTitleId}>
            <EuiTitle>
              <h2 id={flyoutTitleId}>{data.type}</h2>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            {data.type === "dynamic" && (
              <EditDynamic
                name={data?.name}
                description={data?.description}
                condition={data?.condition}
                closeFlyout={() => setOpenFlyout(false)}
              />
            )}
            {data.type === "manual" && (
              <Manual createSegment={() => {}} isCreateSegmentMutating={true} />
            )}
          </EuiFlyoutBody>
        </EuiFlyout>
      )}
    </div>
  );
};

export default GeneralDetails;
