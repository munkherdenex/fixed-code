import {
  Criteria,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButtonIcon,
  EuiEmptyPrompt,
  EuiFieldSearch,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiImage,
  EuiTableFieldDataColumnType,
} from "@elastic/eui";
import { useRouter } from "next/router";
import { useLayoutEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PAGINATION_CHOOSES } from "../../../constants";
import useGetCRMTicketTemplate, {
  CRMTicketTemplate,
  CRMTicketTemplateResponse,
} from "../../../hooks/useGetCRMTicketTemplate";
import { isNumber } from "../../../utils/helper";

const TemplateTable = () => {
  const router = useRouter();
  const { query } = router;
  const translate = useTranslations();

  const querySearch = query?.search?.toString() || "";
  const queryFilter = query?.filter?.toString() || "";
  const queryPageIndex = isNumber(query?.pageIndex) ? +query?.pageIndex : 0;
  const queryPageSize = isNumber(query?.pageSize) ? +query?.pageSize : PAGINATION_CHOOSES[2];

  const [searchValue, setSearchValue] = useState(querySearch);
  const [pageIndex, setPageIndex] = useState(queryPageIndex);
  const [pageSize, setPageSize] = useState(queryPageSize);
  const [filter, setFilter] = useState(queryFilter);

  const pagination = {
    pageIndex,
    pageSize,
    pageSizeOptions: PAGINATION_CHOOSES,
  };

  const { data, isLoading, mutate } = useGetCRMTicketTemplate<CRMTicketTemplateResponse>(
    undefined,
    {
      query: searchValue,
      filter: filter,
      offset: `${pageIndex * pageSize}`,
      limit: `${pageSize}`,
    },
  );

  const columns: Array<EuiBasicTableColumn<CRMTicketTemplate>> = [];

  const onSearch = (value: string) => {
    setSearchValue(value);
    router.push({ query: { search: value, filter } });
  };

  const onTableChange = ({ page }: Criteria<CRMTicketTemplate>) => {
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

  const getRowProps = (template: CRMTicketTemplate) => {
    const { id } = template;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => router.push(`/dashboards/cdp/campaign/info/${id}`),
    };
  };

  const getCellProps = (
    template: CRMTicketTemplate,
    column: EuiTableFieldDataColumnType<CRMTicketTemplate>,
  ) => {
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
    return <div>{translate("loading")}</div>;
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
            <p>{translate("the_campaign_description")}</p>
          </>
        }
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
                  placeholder={translate("search_campaign")}
                />
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
          <div>{translate("loading")}</div>
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

export default TemplateTable;
