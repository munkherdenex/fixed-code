import {
  Criteria,
  EuiBadge,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButton,
  EuiButtonIcon,
  EuiEmptyPrompt,
  EuiFieldSearch,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiImage,
  EuiSelect,
  EuiTableFieldDataColumnType,
} from "@elastic/eui";
import moment from "moment";
import { useRouter } from "next/router";
import { useEffect, useLayoutEffect, useState } from "react";
import { PAGINATION_CHOOSES } from "../../constants";
import useGetTemplates, { Template, TemplateResponse } from "../../hooks/useGetTemplates";
import { badgeColor } from "../../utils/badge_color";
import { getDataKind, isNumber } from "../../utils/helper";
import CreateCampaignActionPopover from "./create_campaign_action_popover";

const options = [
  { value: "", text: "All" },
  { value: "DRAFT", text: "DRAFT" },
  { value: "APPROVED", text: "APPROVED" },
  { value: "DONE", text: "DONE" },
  { value: "SENDING", text: "SENDING" },
  { value: "SENT", text: "SENT" },
  { value: "ERROR", text: "ERROR" },
];

const SendsTable = () => {
  const router = useRouter();
  const { query } = router;

  const querySearch = query?.search?.toString() || "";
  const queryFilter = query?.filter?.toString() || "";
  const queryPageIndex = isNumber(query?.pageIndex) ? +query?.pageIndex : 0;
  const queryPageSize = isNumber(query?.pageSize) ? +query?.pageSize : PAGINATION_CHOOSES[0];

  const [searchValue, setSearchValue] = useState(querySearch);
  const [pageIndex, setPageIndex] = useState(queryPageIndex);
  const [pageSize, setPageSize] = useState(queryPageSize);
  const [filter, setFilter] = useState(queryFilter);

  const pagination = {
    pageIndex,
    pageSize,
    pageSizeOptions: PAGINATION_CHOOSES,
  };

  const { data, isLoading, mutate } = useGetTemplates<TemplateResponse>(undefined, {
    query: searchValue,
    filter: filter,
    offset: `${pageIndex * pageSize}`,
    limit: `${pageSize}`,
  });

  const columns: Array<EuiBasicTableColumn<Template>> = [
    {
      field: "title",
      name: "Title",
      "data-test-subj": "titleCell",
    },
    {
      name: "Kind",
      "data-test-subj": "kindCell",
      render: (template: Template) => {
        //INFO: This is a workaround to get the kind of the template becaouse of POCKET
        const dataKind = getDataKind(template);

        return <span>{dataKind}</span>;
      },
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
    router.push({ query: { search: value, filter } });
  };

  const onFilter = (value: string) => {
    setFilter(value);
    router.push({ query: { filter: value, search: searchValue } });
  };

  const onTableChange = ({ page }: Criteria<Template>) => {
    if (page) {
      const { index: newPageIndex, size: newPageSize } = page;
      router.push({
        query: {
          pageIndex: newPageIndex,
          pageSize: newPageSize,
          filter: filter,
          search: searchValue,
        },
      });
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
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

  // Condensed useEffect logic to update states when query parameters change
  useLayoutEffect(() => {
    if (querySearch !== searchValue) {
      setSearchValue(querySearch);
    }
    if (queryFilter !== filter) {
      setFilter(queryFilter);
    }
    if (queryPageIndex !== pageIndex) {
      setPageIndex(queryPageIndex);
    }
    if (queryPageSize !== pageSize) {
      setPageSize(queryPageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryPageIndex, queryPageSize, querySearch, queryFilter]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (data?.results?.length === 0 && !searchValue && !filter) {
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
        actions={<CreateCampaignActionPopover />}
      />
    );
  }

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiFlexGroup responsive={false} justifyContent="spaceBetween" alignItems="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiFlexGrid columns={3}>
              <EuiFlexItem grow={false}>
                <EuiFieldSearch
                  defaultValue={searchValue}
                  onSearch={onSearch}
                  placeholder="Search Campaign"
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiSelect
                  options={options}
                  value={filter}
                  onChange={(e) => {
                    onFilter(e.target.value);
                  }}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <div>
                  <EuiButton
                    color="success"
                    onClick={() => {
                      onFilter("DONE");
                    }}
                  >
                    Done
                  </EuiButton>
                </div>
              </EuiFlexItem>
            </EuiFlexGrid>
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
