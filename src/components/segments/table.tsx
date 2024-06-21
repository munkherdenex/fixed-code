import {
  EuiBasicTableColumn,
  EuiTableFieldDataColumnType,
  EuiBasicTable,
  formatDate,
} from "@elastic/eui";
import moment from "moment";
import router from "next/router";
import useGetSegments, { Segment } from "../../hooks/useGetSegments";

const pathPrefix = process.env.PATH_PREFIX;

const SegmentsTable = () => {
  const { data, isLoading } = useGetSegments<Segment[]>();

  const columns: Array<EuiBasicTableColumn<Segment>> = [
    {
      field: "id",
      name: "ID",
      "data-test-subj": "idCell",
      mobileOptions: {
        render: (segment: Segment) => <>{segment.id}</>,
        enlarge: true,
      },
    },
    {
      field: "name",
      name: "Name",
      "data-test-subj": "nameCell",
      mobileOptions: {
        render: (segment: Segment) => <>{segment.name}</>,
        enlarge: true,
      },
    },
    {
      field: "description",
      name: "Description",
      "data-test-subj": "descriptionCell",
      mobileOptions: {
        render: (segment: Segment) => <>{segment.description}</>,
        enlarge: true,
      },
    },
    {
      field: "type",
      name: "Type",
      "data-test-subj": "typeCell",
      mobileOptions: {
        render: (segment: Segment) => <>{segment.type}</>,
        enlarge: true,
      },
    },
    {
      field: "created_at",
      name: "Created at",
      "data-test-subj": "createdAtCell",
      mobileOptions: {
        enlarge: true,
      },
    },
  ];

  const getRowProps = (segment: Segment) => {
    const { id } = segment;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/segments/info/${id}`);
      },
    };
  };

  const getCellProps = (segment: Segment, column: EuiTableFieldDataColumnType<Segment>) => {
    const { id } = segment;
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

export default SegmentsTable;
