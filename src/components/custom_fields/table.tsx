import { EuiBasicTableColumn, EuiTableFieldDataColumnType, EuiBasicTable } from "@elastic/eui";
import moment from "moment";
import router from "next/router";
import useGetFields, { Fields } from "../../hooks/useGetFields";

const pathPrefix = process.env.PATH_PREFIX;

const FieldsTable = () => {
  const { data, isLoading } = useGetFields<Fields[]>();

  const columns: Array<EuiBasicTableColumn<Fields>> = [
    {
      field: "id",
      name: "ID",
      "data-test-subj": "idCell",
      mobileOptions: {
        render: (fields: Fields) => <>{fields.id}</>,
        enlarge: true,
      },
    },
    {
      field: "name",
      name: "Name",
      "data-test-subj": "nameCell",
      mobileOptions: {
        render: (fields: Fields) => <>{fields.name}</>,
        enlarge: true,
      },
    },
    {
      field: "attribute_name",
      name: "Attribute",
      "data-test-subj": "attributeCell",
      mobileOptions: {
        render: (fields: Fields) => <>{fields.attribute_name}</>,
        enlarge: true,
      },
    },
    {
      field: "data_type",
      name: "Data type",
      "data-test-subj": "typeCell",
      render: (data: string) => <>{data}</>,
      mobileOptions: {
        render: (fields: Fields) => <>{fields.data_type}</>,
        enlarge: true,
      },
    },
    {
      field: "created_at",
      name: "Created at",
      "data-test-subj": "createdAtCell",
      render: (fields: Fields) => moment(fields.created_at).format("YYYY-MM-DD HH:mm:ss"),
      mobileOptions: {
        render: (fields: Fields) => moment(fields.created_at).format("YYYY-MM-DD HH:mm:ss"),
        enlarge: true,
      },
    },
  ];

  const getRowProps = (fields: Fields) => {
    const { id } = fields;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/custom_fields/info/${id}`);
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
      items={data || []}
      rowHeader="firstName"
      columns={columns}
      rowProps={getRowProps}
      cellProps={getCellProps}
    />
  );
};

export default FieldsTable;
