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
  EuiFormRow,
  EuiPanel,
  EuiSkeletonRectangle,
  EuiSpacer,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { jsonrepair } from "jsonrepair";
import moment from "moment";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { SetStateAction, useState } from "react";
import useDeleteChannel from "../../hooks/useDeleteChannel";
import useGetChannels, { Channels } from "../../hooks/useGetChannels";
import { badgeColor } from "../../utils/badge_color";
import EditChannelFlyot from "./edit_channel_flyot";

const DeleteConfirmModal = ({
  setIsModalVisible,
}: {
  setIsModalVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const modalTitleId = useGeneratedHtmlId();
  const translate = useTranslations();

  const { trigger, isMutating } = useDeleteChannel(router.query.id);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");

  const closeModal = async () => {
    setIsModalVisible(false);
  };

  const confirmModal = async () => {
    router.replace("/dashboards/cdp/channels");
    try {
      await trigger();
    } catch (error) {
      console.error(error);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeleteConfirmValue(e.target.value);
  };

  return (
    <EuiConfirmModal
      aria-labelledby={modalTitleId}
      title={translate("delete_channel")}
      onCancel={closeModal}
      onConfirm={() => {
        confirmModal();
      }}
      confirmButtonText={translate("delete")}
      cancelButtonText={translate("cancel")}
      buttonColor="danger"
      isLoading={isMutating}
      confirmButtonDisabled={deleteConfirmValue.toLowerCase() !== "delete"}
    >
      <EuiCallOut title="Proceed with caution!" color="warning" iconType="warning">
        <p>{translate("delete_warning")}</p>
      </EuiCallOut>
      <EuiSpacer />
      <EuiFormRow label={translate("delete_label")}>
        <EuiFieldText
          isLoading={isMutating}
          name="delete"
          type="text"
          value={deleteConfirmValue}
          onChange={onChange}
        />
      </EuiFormRow>
    </EuiConfirmModal>
  );
};

const DeleteConfirmModalContainer = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  return (
    <>
      <EuiFlexItem grow={false}>
        <EuiButtonIcon
          display="base"
          iconType="trash"
          aria-label="Delete"
          color="danger"
          onClick={() => setIsModalVisible(true)}
        />
      </EuiFlexItem>
      {isModalVisible && <DeleteConfirmModal setIsModalVisible={setIsModalVisible} />}
    </>
  );
};

const GeneralDetails = () => {
  const router = useRouter();
  const translate = useTranslations();

  const { data, isLoading } = useGetChannels<Channels>(router.query.id);
  const [isEditFlyoutVisible, setIsEditFlyoutVisible] = useState(false);

  return (
    <div>
      <EuiPanel>
        <EuiSkeletonRectangle
          isLoading={isLoading || !data}
          width="100%"
          height={355}
          borderRadius="m"
        >
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <EuiPanel paddingSize="s" color="subdued">
                <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
                  <EuiFlexItem grow={false}>
                    <strong>{translate("channel_details")}</strong>
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
                      <DeleteConfirmModalContainer />
                    </EuiFlexGroup>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiPanel>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFlexGrid columns={2}>
                <EuiFlexItem>{translate("name")}:</EuiFlexItem>
                <EuiFlexItem>{data?.name}</EuiFlexItem>
                <EuiFlexItem>{translate("channel_type")}:</EuiFlexItem>
                <EuiFlexItem>
                  <div>
                    <EuiBadge color={badgeColor(data?.channel_type)}>
                      {data?.channel_type.toUpperCase()}
                    </EuiBadge>
                  </div>
                </EuiFlexItem>
                <EuiFlexItem>{translate("data")}:</EuiFlexItem>
                <EuiFlexItem>
                  <EuiCodeBlock
                    language="json"
                    fontSize="s"
                    paddingSize="s"
                    lineNumbers
                    isCopyable
                    overflowHeight={300}
                  >
                    <pre>{JSON.stringify(JSON.parse(jsonrepair(data?.data || "{}")), null, 2)}</pre>
                  </EuiCodeBlock>
                </EuiFlexItem>
                <EuiFlexItem>{translate("created_at")}:</EuiFlexItem>
                <EuiFlexItem>{moment(data?.created_at).format("YYYY-MM-DD LT")}</EuiFlexItem>
                <EuiFlexItem>{translate("updated_at")}:</EuiFlexItem>
                <EuiFlexItem>{moment(data?.updated_at).format("YYYY-MM-DD LT")}</EuiFlexItem>
              </EuiFlexGrid>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiSkeletonRectangle>
      </EuiPanel>
      {isEditFlyoutVisible && (
        <EditChannelFlyot setIsFlyoutVisible={setIsEditFlyoutVisible} data={data} />
      )}
    </div>
  );
};

export default GeneralDetails;
