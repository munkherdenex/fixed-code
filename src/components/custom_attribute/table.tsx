import {
  Criteria,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiCallOut,
  EuiConfirmModal,
  EuiEmptyPrompt,
  EuiFieldText,
  EuiFormRow,
  EuiImage,
  EuiSpacer,
  EuiTableFieldDataColumnType,
  useGeneratedHtmlId,
} from "@elastic/eui";
import moment from "moment";
import { useRouter } from "next/router";
import { SetStateAction, useLayoutEffect, useState } from "react";
import { PAGINATION_CHOOSES } from "../../constants";
import useDeleteField from "../../hooks/useDeleteCustomField";
import useGetFields, { Fields, FieldsResponse } from "../../hooks/useGetFields";
import { globalMutate } from "../../utils/globalMutate";
import { isNumber } from "../../utils/helper";
import CreateFieldFlyoutContainer from "./create_field_flyout_container";
import { useTranslations } from "next-intl";

const DeleteConfirmModal = ({
  setIsModalVisible,
  selectedField,
}: {
  setIsModalVisible: React.Dispatch<SetStateAction<boolean>>;
  selectedField: Fields | null;
}) => {
  const modalTitleId = useGeneratedHtmlId();
  const translate = useTranslations();

  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");

  const { trigger, isMutating } = useDeleteField(`${selectedField?.id}`);

  const closeModal = async () => {
    setIsModalVisible(false);
  };

  const confirmModal = async () => {
    try {
      await trigger();
    } catch (error) {
      console.error(error);
    }
    globalMutate("fields");
    setIsModalVisible(false);
    setDeleteConfirmValue("");
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeleteConfirmValue(e.target.value);
  };

  return (
    <EuiConfirmModal
      aria-labelledby={modalTitleId}
      title={translate("delete_title")}
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
        <p>{translate("delete_description")}</p>
      </EuiCallOut>
      <EuiSpacer />
      <EuiFormRow label={translate("delete_form_label")}>
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

const FieldsTable = () => {
  const router = useRouter();
  const { query } = router;
  const translate = useTranslations();

  const queryPageIndex = isNumber(query?.pageIndex) ? +query?.pageIndex : 0;
  const queryPageSize = isNumber(query?.pageSize) ? +query?.pageSize : PAGINATION_CHOOSES[2];

  const [pageIndex, setPageIndex] = useState(queryPageIndex);
  const [pageSize, setPageSize] = useState(queryPageSize);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedField, setSelectedField] = useState<Fields | null>(null);

  const pagination = {
    pageIndex,
    pageSize,
    pageSizeOptions: PAGINATION_CHOOSES,
  };

  const { data, isLoading } = useGetFields<FieldsResponse>(undefined, {
    offset: `${pageIndex * pageSize}`,
    limit: `${pageSize}`,
  });

  const columns: Array<EuiBasicTableColumn<Fields>> = [
    {
      field: "name",
      name: translate("name"),
      "data-test-subj": "nameCell",
    },
    {
      field: "attribute_name",
      name: translate("attribute"),
      "data-test-subj": "attributeCell",
    },
    {
      field: "data_type",
      name: translate("Data type"),
      "data-test-subj": "typeCell",
    },
    {
      field: "created_at",
      name: translate("created_at"),
      "data-test-subj": "createdAtCell",
      render: (date: string) => {
        return moment(date).format("YYYY-MM-DD LT");
      },
    },
    {
      name: translate("actions"),
      footer: () => {
        return <strong>Total: {data?.total_count || 0}</strong>;
      },
      actions: [
        {
          name: "Delete",
          isPrimary: true,
          icon: "trash",
          color: "danger",
          type: "icon",
          description: "Delete customer",
          onClick: (field: Fields) => {
            setSelectedField(field);
            setIsDeleteModalVisible(true);
          },
        },
      ],
    },
  ];

  const onTableChange = ({ page }: Criteria<Fields>) => {
    if (page) {
      const { index: newPageIndex, size: newPageSize } = page;
      router.push({ query: { pageIndex: newPageIndex, pageSize: newPageSize } });
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const getCellProps = (fields: Fields, column: EuiTableFieldDataColumnType<Fields>) => {
    const { id } = fields;
    const { field } = column;

    return {
      className: "customCellClass",
      "data-test-subj": `cell-${id}-${String(field)}`,
      textOnly: true,
    };
  };

  // Condensed useEffect logic to update states when query parameters change
  useLayoutEffect(() => {
    setPageIndex(queryPageIndex);
    setPageSize(queryPageSize);
  }, [queryPageIndex, queryPageSize]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (data?.results?.length === 0) {
    return (
      <EuiEmptyPrompt
        icon={<EuiImage size="s" src="/images/home/empty.png" alt="" />}
        title={<h2>{translate("create_custom_attribute")}</h2>}
        layout="horizontal"
        color="plain"
        actions={<CreateFieldFlyoutContainer />}
      />
    );
  }

  return (
    <>
      <EuiBasicTable
        items={data?.results || []}
        columns={columns}
        cellProps={getCellProps}
        pagination={
          data?.total_count > pageSize
            ? {
                ...pagination,
                totalItemCount: data?.total_count || 0,
                showPerPageOptions: true,
              }
            : {
                totalItemCount: 0,
                pageSize: 0,
                pageIndex: 0,
              }
        }
        onChange={onTableChange}
      />
      {isDeleteModalVisible && (
        <DeleteConfirmModal
          setIsModalVisible={setIsDeleteModalVisible}
          selectedField={selectedField}
        />
      )}
    </>
  );
};

export default FieldsTable;
