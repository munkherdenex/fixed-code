import {
  Criteria,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTableFieldDataColumnType,
} from "@elastic/eui";
import { useRouter } from "next/router";
import { useState } from "react";
import useGetTemplatesCustomer, { TemplateCustomer } from "../../hooks/useGetTemplatesCustomer";
import AddAudienceFlyout from "./add_audience_flyot";

const Audience = () => {
  const router = useRouter();
  const { data } = useGetTemplatesCustomer<TemplateCustomer[]>(router.query.id);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isAddAudienceFlyoutVisible, setIsAddAudienceFlyoutVisible] = useState(false);

  const pagination = {
    pageIndex,
    pageSize,
    totalItemCount: 20,
    pageSizeOptions: [20, 10, 5],
  };

  const columns: Array<EuiBasicTableColumn<TemplateCustomer>> = [
    {
      field: "name",
      name: "Name",
      "data-test-subj": "nameCell",
    },
    {
      field: "type",
      name: "Type",
      "data-test-subj": "typeCell",
    },
  ];

  const onTableChange = ({ page }: Criteria<TemplateCustomer>) => {
    if (page) {
      const { index: pageIndex, size: pageSize } = page;
      setPageIndex(pageIndex);
      setPageSize(pageSize);
    }
  };

  const getRowProps = (template: TemplateCustomer) => {
    const { object_id } = template;
    return {
      "data-test-subj": `row-${object_id}`,
      className: "customRowClass",
      onClick: () => router.push(`/dashboards/customers/info/${object_id}`),
    };
  };

  const getCellProps = (
    template: TemplateCustomer,
    column: EuiTableFieldDataColumnType<TemplateCustomer>,
  ) => {
    const { object_id } = template;
    const { field } = column;

    return {
      className: "customCellClass",
      "data-test-subj": `cell-${object_id}-${String(field)}`,
      textOnly: true,
    };
  };

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <div>
          <EuiButton
            size="s"
            iconType="plusInCircle"
            onClick={() => setIsAddAudienceFlyoutVisible(true)}
          >
            Add audience
          </EuiButton>
        </div>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiBasicTable
          tableCaption="Template customers"
          items={data || []}
          columns={columns}
          rowProps={getRowProps}
          cellProps={getCellProps}
          pagination={pagination}
          onChange={onTableChange}
        />
      </EuiFlexItem>
      {isAddAudienceFlyoutVisible && (
        <AddAudienceFlyout closeFlyout={() => setIsAddAudienceFlyoutVisible(false)} />
      )}
    </EuiFlexGroup>
  );
};

export default Audience;
