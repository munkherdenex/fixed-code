import {
  EuiBasicTableColumn,
  EuiTableFieldDataColumnType,
  EuiBasicTable,
  Criteria,
} from "@elastic/eui";
import router from "next/router";
import { useState } from "react";
import { PAGINATION_CHOOSES } from "../../constants";
import useGetFields, { Fields, FieldsResponse } from "../../hooks/useGetFields";

const pathPrefix = process.env.PATH_PREFIX;

const FieldsTable = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

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
  ];

  const onTableChange = ({ page }: Criteria<Fields>) => {
    if (page) {
      const { index: pageIndex, size: pageSize } = page;
      setPageIndex(pageIndex);
      setPageSize(pageSize);
    }
  };

  const getRowProps = (fields: Fields) => {
    const { id } = fields;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/custom_attribute/info/${id}`);
      },
    };
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
    <EuiBasicTable
      tableCaption="Demo of EuiBasicTable"
      items={data?.results || []}
      rowHeader="firstName"
      columns={columns}
      rowProps={getRowProps}
      cellProps={getCellProps}
      pagination={{
        ...pagination,
        totalItemCount: data?.count || 0,
        showPerPageOptions: true,
      }}
      onChange={onTableChange}
    />
  );
};

export default FieldsTable;
