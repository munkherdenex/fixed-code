import {
  Criteria,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiConfirmModal,
  EuiFieldText,
  EuiFormRow,
  EuiTableFieldDataColumnType,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { SetStateAction, useState } from "react";
import { PAGINATION_CHOOSES } from "../../constants";
import useDeleteField from "../../hooks/useDeleteCustomField";
import useGetFields, { Fields, FieldsResponse } from "../../hooks/useGetFields";
import { globalMutate } from "../../utils/globalMutate";

const DeleteConfirmModal = ({
  setIsModalVisible,
  selectedField,
}: {
  setIsModalVisible: React.Dispatch<SetStateAction<boolean>>;
  selectedField: Fields | null;
}) => {
  const modalTitleId = useGeneratedHtmlId();
  const { trigger, isMutating } = useDeleteField(`${selectedField?.id}`);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");

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
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
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
      const { index: pageIndex, size: pageSize } = page;
      setPageIndex(pageIndex);
      setPageSize(pageSize);
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

  if (isLoading) {
    return <div>Loading...</div>;
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
