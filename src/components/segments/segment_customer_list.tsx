import {
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiPanel,
  EuiTableFieldDataColumnType,
} from "@elastic/eui";
import { useRouter } from "next/router";
import useGetSegmentCustomerList, {
  SegmentCustomer,
  SegmentCustomerResponse,
} from "../../hooks/useGetSegmentCustomerList";

const SegmentCustomerList = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data, isLoading } = useGetSegmentCustomerList<SegmentCustomerResponse>(id);

  const columns: Array<EuiBasicTableColumn<SegmentCustomer>> = [
    {
      field: "id",
      name: "ID",
      "data-test-subj": "idCell",
    },
    {
      field: "email",
      name: "Email",
      "data-test-subj": "emailCell",
      truncateText: true,
    },
    {
      field: "phone",
      name: "Phone",
      "data-test-subj": "phoneCell",
    },
    {
      field: "rid",
      name: "Reference ID",
      "data-test-subj": "ridCell",
      truncateText: true,
    },
    {
      field: "created_at",
      name: "Created at",
      "data-test-subj": "createdAtCell",
    },
    {
      field: "created_by",
      name: "Created by",
      "data-test-subj": "createdByCell",
    },
  ];

  //INFO: ireeduid ashiglawal holbono
  const getRowProps = (segmentCustomer: SegmentCustomer) => {
    const { id } = segmentCustomer;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => router.push(`/dashboards/audience/info/${id}`),
    };
  };

  const getCellProps = (
    segmentCustomer: SegmentCustomer,
    column: EuiTableFieldDataColumnType<SegmentCustomer>,
  ) => {
    const { id } = segmentCustomer;
    const { field } = column;

    return {
      className: "customCellClass",
      "data-test-subj": `cell-${id}-${String(field)}`,
      textOnly: true,
    };
  };

  //add loading state
  if (isLoading) return <div>loading...</div>;

  //add empty state
  if (!data) return <div>empty</div>;

  return (
    <EuiPanel>
      <EuiBasicTable
        tableCaption="Send table"
        items={data?.results || []}
        columns={columns}
        cellProps={getCellProps}
      />
    </EuiPanel>
  );
};

export default SegmentCustomerList;
