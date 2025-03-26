import {
  Criteria,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButtonIcon,
  EuiFieldSearch,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTab,
  EuiTableFieldDataColumnType,
  EuiTabs,
} from "@elastic/eui";
import { useRouter } from "next/router";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { PAGINATION_CHOOSES } from "../../constants";
import { Template } from "../../hooks/useGetTemplates";
import { isNumber } from "../../utils/helper";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import ticketApi from "../../api/ticket";
import moment from "moment";
import ticketTemplateApi from "@/api/ticket_template";

const Table = () => {
  const router = useRouter();
  const { query } = router;
  const translate = useTranslations();

  const querySearch = query?.search?.toString() || null;
  const queryFilter = query?.filter?.toString() || null;
  const queryPageIndex = isNumber(query?.pageIndex) ? +query?.pageIndex : null;
  const queryPageSize = isNumber(query?.pageSize) ? +query?.pageSize : null;

  const [searchValue, setSearchValue] = useState(querySearch);
  const [pageIndex, setPageIndex] = useState(queryPageIndex);
  const [pageSize, setPageSize] = useState(queryPageSize);
  const [filter, setFilter] = useState(queryFilter);

  const [selectedTabId, setSelectedTabId] = useState(query?.tab || "all-tab--id");
  const [tabs, setTabs] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const tabsData = await ticketTemplateApi.getTicketTabs()
      if (Array.isArray(tabsData)) {
        tabsData.reverse().push({
          name: "Бүх",
          id: 0,
        });
        setTabs(tabsData.reverse().map((tab) => ({ id: `tab--${tab.id}`, name: tab.name })));
        setSelectedTabId("tab--0");
      }
    }
    fetchData();
  }, []);

  const onSelectedTabChanged = (tab: any) => {
    setSelectedTabId(tab.id);
  };

  const renderTabs = () => {
    if (!tabs) return;

    if (Array.isArray(tabs)) {
      return tabs.map((tab, index) => (
        <EuiTab
          key={index}
          onClick={() => onSelectedTabChanged(tab)}
          isSelected={tab.id === selectedTabId}
        >
          {tab.name}
        </EuiTab>
      ));
    }
  };

  const pagination = {
    pageIndex,
    pageSize,
    pageSizeOptions: PAGINATION_CHOOSES,
  };

  //TODO: create api request
  const { data, isLoading, mutate } = useSWR(
    ["/crm/ticket/", searchValue, filter, pageIndex, pageSize],
    () =>
      ticketApi.getTickets({
        search: searchValue,
        filter,
        offset: pageIndex,
        limit: pageSize,
      }),
  );

  const columns: Array<EuiBasicTableColumn<any>> = [
    {
      field: "id",
      name: "Тикет ID",
      render: (id) => <>{"#" + id}</>,
    },
    {
      field: "assigned_to",
      name: "Хариуцагч",
    },
    {
      field: "category",
      name: "Төрөл",
    },
    {
      field: "status",
      name: "Төлөв",
      render: (status) => <>{status == "open" ? "Нээлттэй" : "Хаалттай"}</>,
    },
    {
      field: "created_at",
      name: "Үүсгэсэн огноо",
      render: (date) => <>{moment(date).format("YYYY-MM-DD HH:MM")}</>,
    },
    {
      field: "created_by",
      name: "Үүсгэсэн ажилтан",
    },
  ];

  const onSearch = (value: string) => {
    setSearchValue(value);
    router.push({ query: { search: value, filter } });
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
      onClick: () => router.push(`/dashboards/crm/ticket/${id}`),
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
    return <div>{translate("loading")}</div>;
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
                  placeholder={translate("search")}
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
        <EuiTabs>{renderTabs()}</EuiTabs>
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

export default Table;
