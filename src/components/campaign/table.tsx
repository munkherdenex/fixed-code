import {
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButton,
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
import useGetTemplates, { Template, TemplateResponse } from "../../hooks/useGetTemplates";

const schema = yup.object({
  search: yup.string().notRequired(),
});

const SendsTable = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const { data, isLoading, mutate } = useGetTemplates<TemplateResponse>(undefined, searchValue);

  const {
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

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

  const onSearch = (value: string) => {
    setSearchValue(value);
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
            <EuiButton isLoading={isLoading} onClick={() => mutate()}>
              Refresh
            </EuiButton>
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
          />
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default SendsTable;
