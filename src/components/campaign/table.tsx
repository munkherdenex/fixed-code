import {
  Criteria,
  EuiBadge,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButtonIcon,
  EuiEmptyPrompt,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiImage,
  EuiTableFieldDataColumnType,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { PAGINATION_CHOOSES } from "../../constants";
import useGetTemplates, { Template, TemplateResponse } from "../../hooks/useGetTemplates";
import { badgeColor } from "../../utils/badge_color";

const schema = yup.object({
  search: yup.string().notRequired(),
});

const SendsTable = ({ createCampaignAction }: { createCampaignAction: ReactElement }) => {
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
    query: searchValue,
    offset: `${pageIndex * pageSize}`,
    limit: `${pageSize}`,
  });

  const {
    control,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
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
      name: "Status",
      render: (template: Template) => {
        const { status } = template;
        return (
          <span>
            <EuiBadge color={badgeColor(status)}>{status}</EuiBadge>
          </span>
        );
      },
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
      field: "created_by",
      name: "Created by",
      "data-test-subj": "createdByCell",
      footer: () => {
        return <strong>Total: {data?.total_count || 0}</strong>;
      },
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (data?.results?.length === 0 && searchValue === "") {
    return (
      <EuiEmptyPrompt
        icon={<EuiImage size="s" src="/images/home/empty.png" alt="" />}
        title={<h2>Create your campaign</h2>}
        layout="horizontal"
        color="plain"
        body={
          <>
            <p>The campaign description</p>
          </>
        }
        actions={createCampaignAction}
      />
    );
  }

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiFlexGroup responsive={false} justifyContent="spaceBetween" alignItems="flexEnd">
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
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default SendsTable;
