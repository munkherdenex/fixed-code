import {
  EuiBadge,
  EuiButtonIcon,
  EuiCallOut,
  EuiCodeBlock,
  EuiConfirmModal,
  EuiExpression,
  EuiFieldText,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFormRow,
  EuiPanel,
  EuiSkeletonRectangle,
  EuiSpacer,
  EuiTextColor,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { jsonrepair } from "jsonrepair";
import moment from "moment";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { SetStateAction, useState } from "react";
import { parseMongoDB } from "react-querybuilder/parseMongoDB";
import useDeleteSegment from "../../hooks/useDeleteSegment";
import useGetFields, { Fields } from "../../hooks/useGetFields";
import { getTheme } from "../../lib/theme";
import { useSegmentContext } from "../../store/segment_store";
import { additionalOperator } from "../../utils/additional_operator";
import { badgeColor } from "../../utils/badge_color";
import { removeDeletedCustomFields } from "../../utils/helper";
import EditDynamic from "./edit_dynamic";
import { generalDetailsStyles } from "./general_details.styles";
import Manual from "./manual";

const DisplayDataConditionExpression = ({ query }) => {
  if (query?.rules?.length === 0) {
    return <p>No condition</p>;
  }

  return (
    <span>
      {query?.rules?.map((rule, index) => (
        <>
          {!rule.rules && (
            <>
              <EuiExpression
                description={index !== 0 && query.combinator}
                value={rule.field}
                onClick={() => {}}
              />
              <EuiExpression description={rule.operator} value={rule.value} onClick={() => {}} />
            </>
          )}
          {rule.rules && rule.rules.length > 0 && (
            <>
              <EuiExpression description={query.combinator} onClick={() => {}} /> ({" "}
              <DisplayDataConditionExpression query={rule} /> ){" "}
            </>
          )}
        </>
      ))}
    </span>
  );
};

const DeleteConfirmModal = ({
  setIsModalVisible,
}: {
  setIsModalVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const modalTitleId = useGeneratedHtmlId();
  const translate = useTranslations();

  const { trigger, isMutating } = useDeleteSegment(router.query.id);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");

  const closeModal = async () => {
    setIsModalVisible(false);
  };

  const confirmModal = async () => {
    await router.replace("/dashboards/cdp/segments");
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
      title={translate("delete_segment")}
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
      <EuiCallOut title={translate("proceed_with_caution")} color="warning" iconType="warning">
        <p>This action cannot be undone. This will permanently delete the segment.</p>
      </EuiCallOut>
      <EuiSpacer />
      <EuiFormRow label={translate("type_the_word_delete_confirm")}>
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
  const theme = getTheme();
  const styles = generalDetailsStyles(theme);
  const translate = useTranslations();

  const { data, isLoading } = useSegmentContext();
  const { data: cfData } = useGetFields<Fields[]>(undefined, {
    all: `${true}`,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [openFlyout, setOpenFlyout] = useState(false);

  const flyoutTitleId = useGeneratedHtmlId({
    prefix: "flyoutTitle",
  });

  return (
    <div>
      <EuiPanel>
        <EuiSkeletonRectangle isLoading={isLoading} width="100%" height={500}>
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <EuiPanel paddingSize="s" color="subdued">
                <EuiFlexGroup responsive={false} alignItems="center" justifyContent="spaceBetween">
                  <EuiFlexItem grow={false}>
                    <strong>{translate("segment_detail")}</strong>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiFlexGroup responsive={false} gutterSize="s">
                      {(data?.type === "dynamic" || data?.type === "static") && (
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
                <EuiFlexItem>{translate("name")}:</EuiFlexItem>
                <EuiFlexItem>{data?.name}</EuiFlexItem>
                <EuiFlexItem>{translate("description")}:</EuiFlexItem>
                <EuiFlexItem>
                  {data?.description && <p>{data?.description}</p>}
                  {!data?.description && <EuiTextColor color="subdued">None</EuiTextColor>}
                </EuiFlexItem>
                <EuiFlexItem>{translate("status")}:</EuiFlexItem>
                <EuiFlexItem>
                  <div>
                    <EuiBadge color={badgeColor(data?.status)}>
                      {data?.status.toUpperCase()}
                    </EuiBadge>
                  </div>
                </EuiFlexItem>
                <EuiFlexItem>{translate("type")}:</EuiFlexItem>
                <EuiFlexItem>
                  <div>
                    <EuiBadge color={badgeColor(data?.type)}>{data?.type.toUpperCase()}</EuiBadge>
                  </div>
                </EuiFlexItem>
              </EuiFlexGrid>
              <EuiSpacer />
              {data?.type !== "manual" && (
                <>
                  <EuiFlexGroup direction="column">
                    <EuiFlexItem>{translate("condition")}:</EuiFlexItem>
                    <>
                      <EuiFlexItem css={styles.conditionContainer}>
                        {data?.type === "dynamic" && (
                          <>
                            <DisplayDataConditionExpression
                              query={removeDeletedCustomFields(
                                cfData,
                                parseMongoDB(data?.condition, {
                                  additionalOperators: additionalOperator,
                                }),
                              )}
                            />
                          </>
                        )}
                        {data?.type === "static" && (
                          <EuiCodeBlock
                            language="json"
                            fontSize="s"
                            paddingSize="s"
                            isCopyable
                            overflowHeight={300}
                          >
                            <pre>
                              {JSON.stringify(JSON.parse(jsonrepair(data?.condition)), null, 2)}
                            </pre>
                          </EuiCodeBlock>
                        )}
                        {data?.type === "retarget" && (
                          <EuiFlexGroup gutterSize="s">
                            <EuiFlexItem grow={false}>
                              <EuiExpression description={''} value={`${Object.keys(data?.condition)[0].toUpperCase()} = TRUE`} />
                            </EuiFlexItem>
                            <EuiFlexItem grow={false}>
                              <EuiExpression description={'AND'} value={'CAMPAIGN_ID'} />
                            </EuiFlexItem>
                            <EuiFlexItem>
                              <EuiExpression description='IS' value={data?.retarget_template_id} />
                            </EuiFlexItem>
                          </EuiFlexGroup>
                        )}
                      </EuiFlexItem>
                    </>
                  </EuiFlexGroup>
                  <EuiSpacer />
                </>
              )}
              <EuiFlexGrid columns={2} responsive={false}>
                <EuiFlexItem>{translate("created_by")}:</EuiFlexItem>
                <EuiFlexItem>{data?.created_by}</EuiFlexItem>
                <EuiFlexItem>{translate("updated_by")} :</EuiFlexItem>
                <EuiFlexItem>{data?.updated_by}</EuiFlexItem>
                <EuiFlexItem>{translate("created_at")}:</EuiFlexItem>
                <EuiFlexItem>{moment(data?.created_at).format("YYYY-MM-DD LT")}</EuiFlexItem>
                <EuiFlexItem>{translate("updated_at")}:</EuiFlexItem>
                <EuiFlexItem>{moment(data?.updated_at).format("YYYY-MM-DD LT")}</EuiFlexItem>
              </EuiFlexGrid>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiSkeletonRectangle>
      </EuiPanel>
      {isModalVisible && <DeleteConfirmModal setIsModalVisible={setIsModalVisible} />}
      {openFlyout && (
        <EuiFlyout onClose={() => setOpenFlyout(false)}>
          <EuiFlyoutHeader hasBorder aria-labelledby={flyoutTitleId}>
            <EuiTitle>
              <h2 id={flyoutTitleId}>{data?.type}</h2>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            {data?.type === "dynamic" && (
              <EditDynamic
                name={data?.name}
                description={data?.description}
                condition={data?.condition}
                closeFlyout={() => setOpenFlyout(false)}
              />
            )}
            {data?.type === "manual" && <Manual name="" description="" />}
          </EuiFlyoutBody>
        </EuiFlyout>
      )}
    </div>
  );
};

export default GeneralDetails;
