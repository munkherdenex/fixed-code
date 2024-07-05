import {
  Criteria,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButtonIcon,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiTableFieldDataColumnType,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { PAGINATION_CHOOSES } from "../../constants";
import useGetTemplates, { Template, TemplateResponse } from "../../hooks/useGetTemplates";

const schema = yup.object({
  search: yup.string().notRequired(),
});

const SendsTable = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const pagination = {
    pageIndex,
    pageSize,
    pageSizeOptions: PAGINATION_CHOOSES,
  };

  const { data, isLoading, mutate } = useGetTemplates<TemplateResponse>(undefined, {
    search: searchValue,
    offset: `${pageIndex * pageSize}`,
    limit: `${pageSize}`,
  });

  const {
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const columns: Array<EuiBasicTableColumn<Template>> = [
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

  const onSearch = (value: string) => {
    setSearchValue(value);
  };

  const onTableChange = ({ page }: Criteria<Template>) => {
    if (page) {
      const { index: pageIndex, size: pageSize } = page;
      setPageIndex(pageIndex);
      setPageSize(pageSize);
    }
  };

  const getRowProps = (template: Template) => {
    const { id } = template;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => router.push(`/dashboards/campaign/info/${id}`),
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
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiFormRow
              label="Search"
              isInvalid={!!errors.search?.message}
              error={[errors.search?.message]}
            >
              <Controller
                control={control}
                name="search"
                render={({ field: { onChange, onBlur, value } }) => (
                  <EuiFieldSearch
                    onChange={onChange}
                    value={value}
                    onBlur={onBlur}
                    onSearch={onSearch}
                    placeholder="Search Campaign"
                    isInvalid={!!errors.search?.message}
                  />
                )}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              display="base"
              iconType="refresh"
              size="s"
              isLoading={isLoading}
              onClick={() => mutate()}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <EuiBasicTable
            tableCaption="Campaign table"
            items={data?.results || []}
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
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default SendsTable;
