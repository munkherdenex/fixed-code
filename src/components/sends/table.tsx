import { EuiBasicTable, EuiBasicTableColumn, EuiTableFieldDataColumnType } from "@elastic/eui";
import { useRouter } from "next/router";
import useGetTemplates, { Template, TemplateResponse } from "../../hooks/useGetTemplates";

const SendsTable = () => {
  const router = useRouter();
  const { data } = useGetTemplates<TemplateResponse>();
  const columns: Array<EuiBasicTableColumn<Template>> = [
    {
      field: "id",
      name: "ID",
      "data-test-subj": "idCell",
    },
    {
      field: "title",
      name: "Title",
      "data-test-subj": "titleCell",
    },
    {
      field: "kind",
      name: "Kind",
      "data-test-subj": "kindCell",
    },
    {
      field: "body",
      name: "Body",
      "data-test-subj": "bodyCell",
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

  const getRowProps = (template: Template) => {
    const { id } = template;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => router.push(`/dashboards/sends/info/${id}`),
    };
  };

  const getCellProps = (template: Template, column: EuiTableFieldDataColumnType<Template>) => {
    const { id } = template;
    const { field } = column;

    return {
      className: "customCellClass",
      "data-test-subj": `cell-${id}-${String(field)}`,
      textOnly: true,
    };
  };

  return (
    <EuiBasicTable
      tableCaption="Send table"
      items={data?.results || []}
      columns={columns}
      rowProps={getRowProps}
      cellProps={getCellProps}
    />
  );
};

export default SendsTable;
