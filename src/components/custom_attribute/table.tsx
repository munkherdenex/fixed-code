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

const DeleteConfirmModal = ({
  setIsModalVisible,
  selectedField,
}: {
  setIsModalVisible: React.Dispatch<SetStateAction<boolean>>;
  selectedField: Fields | null;
}) => {
  const modalTitleId = useGeneratedHtmlId();

  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");

  const { trigger, isMutating } = useDeleteField(`${selectedField?.id}`);

  const closeModal = async () => {
    setIsModalVisible(false);
  };

  const confirmModal = async () => {
    const response = await trigger();
    if (response) {
      globalMutate("fields");
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
      <EuiCallOut title="Proceed with caution!" color="warning" iconType="warning">
        <p>
          You are about to delete this custom attribute. This is a destructive action and cannot be
          undone. Are you sure you want to proceed?
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

const FieldsTable = () => {
  const router = useRouter();
  const { query } = router;

  const queryPageIndex = isNumber(query?.pageIndex) ? +query?.pageIndex : 0;
  const queryPageSize = isNumber(query?.pageSize) ? +query?.pageSize : PAGINATION_CHOOSES[0];

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
      name: "Name",
      "data-test-subj": "nameCell",
    },
    {
      field: "attribute_name",
      name: "Attribute",
      "data-test-subj": "attributeCell",
    },
    {
      field: "data_type",
      name: "Data type",
      "data-test-subj": "typeCell",
    },
    {
      field: "created_at",
      name: "Created at",
      "data-test-subj": "createdAtCell",
      render: (date: string) => {
        return moment(date).format("YYYY-MM-DD LT");
      },
    },
    {
      name: "Actions",
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
        title={<h2>Create your custom attribute</h2>}
        layout="horizontal"
        color="plain"
        body={
          <>
            <p>The custom attribute description</p>
          </>
        }
        actions={<CreateFieldFlyoutContainer />}
      />
    );
  }

  return (
    <>
      <EuiBasicTable
        tableCaption="Custom attribute table caption"
        items={data?.results || []}
        rowHeader="firstName"
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
