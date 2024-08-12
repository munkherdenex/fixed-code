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
  EuiSpacer,
  EuiTextColor,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { jsonrepair } from "jsonrepair";
import moment from "moment";
import { useRouter } from "next/router";
import { SetStateAction, useState } from "react";
import { parseMongoDB } from "react-querybuilder/parseMongoDB";
import useDeleteSegment from "../../hooks/useDeleteSegment";
import useGetFields, { Fields } from "../../hooks/useGetFields";
import useGetSegments, { Segment } from "../../hooks/useGetSegments";
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
      title="Delete segment?"
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
  const styles = generalDetailsStyles();
  const { data, isLoading } = useGetSegments<Segment>(router.query.id);
  const { data: cfData } = useGetFields<Fields[]>(undefined, {
    all: `${true}`,
  });
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
              <EuiFlexItem>
                {data?.description ? (
                  data?.description
                ) : (
                  <EuiTextColor color="subdued">None</EuiTextColor>
                )}
              </EuiFlexItem>
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
            </EuiFlexGrid>
            <EuiSpacer />
            {data.type !== "manual" && (
              <>
                <EuiFlexGroup direction="column">
                  <EuiFlexItem>Condition:</EuiFlexItem>
                  <>
                    <EuiFlexItem css={styles.conditionContainer}>
                      {data.type === "dynamic" && (
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
                      {data.type === "static" && (
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
                    </EuiFlexItem>
                  </>
                </EuiFlexGroup>
                <EuiSpacer />
              </>
            )}
            <EuiFlexGrid columns={2} responsive={false}>
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
