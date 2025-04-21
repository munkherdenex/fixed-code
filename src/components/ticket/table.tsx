import {
  Criteria,
  EuiBadge,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButtonIcon,
  EuiDatePicker,
  EuiFieldSearch,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormControlLayout,
  EuiHorizontalRule,
  EuiSelect,
  EuiSpacer,
  EuiSuperSelect,
  EuiTab,
  EuiTableFieldDataColumnType,
  EuiTabs,
  EuiText,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { useRouter } from "next/router";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { PAGINATION_CHOOSES } from "../../constants";
import { Template } from "../../hooks/useGetTemplates";
import { isNumber } from "../../utils/helper";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import ticketApi from "../../api/ticket";
import tagApi from "@/api/tags";
import moment from "moment";
import ticketTemplateApi from "@/api/ticket_template";

interface Tag {
  id: number;
  name: string;
  color: string;
}

interface TagsResponse {
  results: Tag[];
}

const Table = () => {
  const options = [
    { value: "option_one", text: "Option one" },
    { value: "option_two", text: "Option two" },
    { value: "option_three", text: "Option three" },
  ];
  const router = useRouter();
  const { query } = router;
  const translate = useTranslations();

  const queryCategory = query?.category?.toString() || null;
  const querySearch = query?.search?.toString() || null;
  const queryDateSearch = query?.date?.toString() || null;
  const queryFilter = query?.filter?.toString() || null;
  const queryStatusFilter = query?.status?.toString() || null;
  const queryTypeFilter = query?.tag?.toString() || null;
  const queryPriorityFilter = query?.priority?.toString() || null;
  const queryPageIndex = isNumber(query?.pageIndex) ? +query?.pageIndex : 1;
  const queryPageSize = isNumber(query?.pageSize) ? +query?.pageSize : 5;

  const [ticketCategory, setTicketCategory] = useState(queryCategory);
  const [searchValue, setSearchValue] = useState(querySearch);
  const [searchDateValue, setSearchDateValue] = useState(
    queryDateSearch ? moment(queryDateSearch) : null,
  );
  const [typeFilter, setTypeFilter] = useState(queryTypeFilter);
  const [statusFilter, setStatusFilter] = useState(queryStatusFilter);
  const [priorityFilter, setPriorityFilter] = useState(queryPriorityFilter);
  const [pageIndex, setPageIndex] = useState(queryPageIndex);
  const [pageSize, setPageSize] = useState(queryPageSize);
  const [filter, setFilter] = useState(queryFilter);

  const [selectedTabId, setSelectedTabId] = useState(query?.tab || "all-tab--id");
  const [tabs, setTabs] = useState(null);

  const [value, setValue] = useState(options[1].value);
  const byTypeSelectId = useGeneratedHtmlId({ prefix: "byTypeSelectId" });
  const byStatusSelectId = useGeneratedHtmlId({ prefix: "byStatusSelectId" });
  const byPrioritySelectId = useGeneratedHtmlId({ prefix: "byPrioritySelectId" });

  useEffect(() => {
    async function fetchData() {
      const tabsData = await ticketTemplateApi.getTicketTabs({ compact: true });
      const tabs = tabsData?.results;
      if (Array.isArray(tabs)) {
        tabs.reverse().push({
          name: "Бүх",
          id: 0,
        });
        setTabs(tabs.reverse().map((tab) => ({ id: `tab--${tab.id}`, name: tab.name })));
        setSelectedTabId("tab--0");
      }
    }
    fetchData();
  }, []);

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
    pageIndex: pageIndex - 1,
    pageSize,
    pageSizeOptions: PAGINATION_CHOOSES,
  };

  //TODO: create api request
  const { data, isLoading, mutate } = useSWR(
    [
      "/crm/ticket/",
      ticketCategory,
      searchValue,
      searchDateValue,
      statusFilter,
      typeFilter,
      priorityFilter,
      filter,
      pageIndex,
      pageSize,
    ],
    () =>
      ticketApi.getTickets({
        ...(ticketCategory && { category: ticketCategory }),
        description: searchValue,
        date: searchDateValue ? searchDateValue.format("YYYY-MM-DD") : null,
        status: statusFilter,
        tag: typeFilter,
        priority: priorityFilter,
        filter,
        offset: pageIndex,
        limit: pageSize,
      }),
  );

  const {
    data: systemTags,
    mutate: mutateTags,
    error: errorTags,
  } = useSWR<TagsResponse>("/crm/tag/", () => tagApi.getTags({ limit: 1000 }));

  const tagsSelectOptions = useMemo(() => {
    if (!systemTags?.results) {
      return [];
    }
    return systemTags.results.map((tag: Tag) => ({
      value: tag.name,
      inputDisplay: tag.name,
    }));
  }, [systemTags]);

  const columns: Array<EuiBasicTableColumn<any>> = [
    {
      field: "id",
      name: "Тикет ID",
      render: (id) => <>{"#" + id}</>,
    },
    {
      field: "category",
      name: "Категори",
      render: (cat) => (cat != "" ? <EuiBadge color="hollow">{cat}</EuiBadge> : null),
    },
    {
      field: "tags",
      name: "Төрөл",
      render: (tags) =>
        tags.length > 0 ? <EuiBadge color="hollow">{tags[0]?.name}</EuiBadge> : null,
    },
    {
      field: "status",
      name: "Төлөв",
      render: (status) => (
        <EuiBadge color={status == "open" ? "success" : "danger"} iconType="dot">
          {status == "open" ? "Нээлттэй" : "Хаалттай"}
        </EuiBadge>
      ),
    },
    {
      field: "assigned_to",
      name: "Хариуцах нэгж болон ажилтан",
    },
    {
      field: "priority",
      name: "Чухлын зэрэг",
      render: (prio) =>
        prio ? (
          <EuiBadge color={prio == "open" ? "success" : "danger"}>
            {prio == "open" ? "Нээлттэй" : "Хаалттай"}
          </EuiBadge>
        ) : null,
    },
    {
      field: "created_at",
      name: "Үүсгэсэн огноо",
      render: (date) => <>{moment(date).format("YYYY-MM-DD HH:MM")}</>,
    },
    {
      field: "created_by",
      name: "Үүсгэсэн ажилтан",
      render: (val) => <>{val?.email}</>,
    },
  ];

  const onSelectedTabChanged = (tab: any) => {
    setSelectedTabId(tab.id);
    if (tab.id == "tab--0") {
      setTicketCategory(null);
      clearAllFilters();
    } else {
      setTicketCategory(tab.name);
      router.push({
        query: {
          pageIndex: 1,
          ...(tab.id != "tab--0" && { category: tab.name }),
          ...(searchDateValue && { date: moment(searchDateValue).format("YYYY-MM-DD") }),
          ...(searchValue && { description: searchValue }),
          ...(statusFilter && { status: statusFilter }),
          ...(typeFilter && { tag: typeFilter }),
          ...(priorityFilter && { priority: priorityFilter }),
          ...(pageSize && { pageSize: 10 }),
        },
      });
    }
  };

  const onSearch = (value: string) => {
    setSearchValue(value);
    router.push({
      query: {
        search: value,
        pageIndex: 1,
        ...(ticketCategory && { category: ticketCategory }),
        ...(pageSize && { pageSize: 10 }),
        ...(searchDateValue && { date: moment(searchDateValue).format("YYYY-MM-DD") }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { tag: typeFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
      },
    });
  };
  const clearSearchFilter = () => {
    setSearchValue(null);
    router.push({
      query: {
        pageIndex: 1,
        ...(ticketCategory && { category: ticketCategory }),
        ...(pageSize && { pageSize: 10 }),
        ...(searchDateValue && { date: moment(searchDateValue).format("YYYY-MM-DD") }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { tag: typeFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
      },
    });
  };
  const onDateSearch = (date: any) => {
    setSearchDateValue(date);
    router.push({
      query: {
        pageIndex: 1,
        date: moment(date).format("YYYY-MM-DD"),
        ...(ticketCategory && { category: ticketCategory }),
        ...(searchValue && { description: searchValue }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { tag: typeFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
        ...(pageSize && { pageSize: 10 }),
      },
    });
  };
  const clearDateFilter = () => {
    setSearchDateValue(null);
    router.push({
      query: {
        pageIndex: 1,
        ...(searchValue && { description: searchValue }),
        ...(ticketCategory && { category: ticketCategory }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { tag: typeFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
        ...(pageSize && { pageSize: 10 }),
      },
    });
  };
  const onTypeChange = (type) => {
    setTypeFilter(type);
    router.push({
      query: {
        tag: type,
        pageIndex: 1,
        ...(pageSize && { pageSize: 10 }),
        ...(ticketCategory && { category: ticketCategory }),
        ...(searchValue && { description: searchValue }),
        ...(searchDateValue && { date: moment(searchDateValue).format("YYYY-MM-DD") }),
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
      },
    });
  };
  const clearTypeFilter = () => {
    setTypeFilter(null);
    router.push({
      query: {
        pageIndex: 1,
        ...(ticketCategory && { category: ticketCategory }),
        ...(pageSize && { pageSize: 10 }),
        ...(searchValue && { description: searchValue }),
        ...(searchDateValue && { date: moment(searchDateValue).format("YYYY-MM-DD") }),
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
      },
    });
  };
  const onStatusChange = (status) => {
    setStatusFilter(status);
    router.push({
      query: {
        status,
        pageIndex: 1,
        ...(ticketCategory && { category: ticketCategory }),
        ...(pageSize && { pageSize: 10 }),
        ...(searchValue && { description: searchValue }),
        ...(searchDateValue && { date: moment(searchDateValue).format("YYYY-MM-DD") }),
        ...(priorityFilter && { priority: priorityFilter }),
        ...(typeFilter && { tag: typeFilter }),
      },
    });
  };
  const clearStatusFilter = () => {
    setStatusFilter(null);
    router.push({
      query: {
        pageIndex: 1,
        ...(ticketCategory && { category: ticketCategory }),
        ...(pageSize && { pageSize: 10 }),
        ...(searchValue && { description: searchValue }),
        ...(searchDateValue && { date: moment(searchDateValue).format("YYYY-MM-DD") }),
        ...(priorityFilter && { priority: priorityFilter }),
        ...(typeFilter && { tag: typeFilter }),
      },
    });
  };
  const onPriorityChange = (priority) => {
    setPriorityFilter(priority);
    router.push({
      query: {
        priority,
        pageIndex: 1,
        ...(ticketCategory && { category: ticketCategory }),
        ...(pageSize && { pageSize: 10 }),
        ...(searchValue && { description: searchValue }),
        ...(searchDateValue && { date: moment(searchDateValue).format("YYYY-MM-DD") }),
        ...(typeFilter && { tag: typeFilter }),
        ...(statusFilter && { status: statusFilter }),
      },
    });
  };
  const clearPriorityFilter = () => {
    setPriorityFilter(null);
    router.push({
      query: {
        pageIndex: 1,
        ...(ticketCategory && { category: ticketCategory }),
        ...(pageSize && { pageSize: 10 }),
        ...(searchValue && { description: searchValue }),
        ...(searchDateValue && { date: moment(searchDateValue).format("YYYY-MM-DD") }),
        ...(typeFilter && { tag: typeFilter }),
        ...(statusFilter && { status: statusFilter }),
      },
    });
  };
  const clearAllFilters = () => {
    setSelectedTabId("tab--0");
    setSearchValue(null);
    setSearchDateValue(null);
    setTypeFilter(null);
    setStatusFilter(null);
    setPriorityFilter(null);
    setPageIndex(1);
    setPageSize(10);
    router.push({ query: { pageIndex: 1, ...(pageSize && { pageSize }) } });
  };

  const resultsCount =
    pageSize === 0 ? (
      <strong>All</strong>
    ) : (
      <>
        <strong>&nbsp;{data?.total_count}:&nbsp;</strong>
        {pageSize * pageIndex - 1}-{pageSize * pageIndex + pageSize} харуулж байна.
      </>
    );

  const onTableChange = ({ page }: Criteria<Template>) => {
    if (page) {
      const { index: newPageIndex, size: newPageSize } = page;
      router.push({
        query: {
          pageIndex: newPageIndex + 1,
          pageSize: newPageSize,
          ...(ticketCategory && { category: ticketCategory }),
          ...(searchValue && { description: searchValue }),
          ...(searchDateValue && { date: moment(searchDateValue).format("YYYY-MM-DD") }),
          ...(typeFilter && { tag: typeFilter }),
          ...(statusFilter && { status: statusFilter }),
          ...(priorityFilter && { priority: priorityFilter }),
        },
      });
      // setPageIndex(newPageIndex);
      // setPageSize(newPageSize);
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
    if (moment(queryDateSearch) !== searchDateValue) {
      setSearchDateValue(queryDateSearch ? moment(queryDateSearch) : null);
    }
    if (queryTypeFilter !== typeFilter) {
      setStatusFilter(queryTypeFilter);
    }
    if (queryStatusFilter !== statusFilter) {
      setStatusFilter(queryStatusFilter);
    }
    if (queryPriorityFilter !== priorityFilter) {
      setStatusFilter(queryPriorityFilter);
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
  }, [
    queryPageIndex,
    queryPageSize,
    querySearch,
    queryTypeFilter,
    queryStatusFilter,
    queryPriorityFilter,
    queryDateSearch,
    queryFilter,
  ]);

  if (isLoading) {
    return <div>{translate("loading")}</div>;
  }

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiFlexGroup responsive={false} justifyContent="spaceBetween" alignItems="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize="s">
              <EuiFlexItem>
                <EuiFormControlLayout
                  {...(searchValue
                    ? {
                        clear: {
                          onClick: () => {
                            clearSearchFilter();
                          },
                          "aria-label": "Clear text filter",
                        },
                      }
                    : null)}
                >
                  <EuiFieldSearch
                    defaultValue={searchValue}
                    onSearch={onSearch}
                    placeholder={translate("search")}
                  />
                </EuiFormControlLayout>
              </EuiFlexItem>

              <EuiFlexItem grow={1}>
                <EuiFormControlLayout
                  {...(searchDateValue
                    ? {
                        clear: {
                          onClick: () => {
                            clearDateFilter();
                          },
                          "aria-label": "Clear date filter",
                        },
                      }
                    : null)}
                >
                  <EuiDatePicker
                    selected={searchDateValue}
                    onChange={onDateSearch}
                    placeholder={translate("date")}
                  />
                </EuiFormControlLayout>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFormControlLayout
                  {...(typeFilter
                    ? {
                        clear: {
                          onClick: () => {
                            clearTypeFilter();
                          },
                          "aria-label": "Clear type filter",
                        },
                      }
                    : null)}
                >
                  <EuiSuperSelect
                    id={byTypeSelectId}
                    options={tagsSelectOptions}
                    valueOfSelected={typeFilter}
                    onChange={onTypeChange}
                    placeholder={translate("searchByType")}
                  />
                </EuiFormControlLayout>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFormControlLayout
                  {...(statusFilter
                    ? {
                        clear: {
                          onClick: () => {
                            clearStatusFilter();
                          },
                          "aria-label": "Clear status filter",
                        },
                      }
                    : null)}
                >
                  <EuiSuperSelect
                    id={byStatusSelectId}
                    options={[
                      {
                        value: "open",
                        inputDisplay: "Нээлттэй",
                      },
                      {
                        value: "close",
                        inputDisplay: "Хаалттай",
                      },
                    ]}
                    valueOfSelected={statusFilter}
                    onChange={onStatusChange}
                    placeholder={translate("searchByStatus")}
                  />
                </EuiFormControlLayout>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFormControlLayout
                  {...(priorityFilter
                    ? {
                        clear: {
                          onClick: () => {
                            clearPriorityFilter();
                          },
                          "aria-label": "Clear priority filter",
                        },
                      }
                    : null)}
                >
                  <EuiSuperSelect
                    id={byPrioritySelectId}
                    options={[
                      {
                        value: "Хэвийн",
                        inputDisplay: "Хэвийн",
                      },
                      {
                        value: "Яаралтай",
                        inputDisplay: "Яаралтай",
                      },
                      {
                        value: "Маш яаралтай",
                        inputDisplay: "Маш яаралтай",
                      },
                    ]}
                    valueOfSelected={priorityFilter}
                    onChange={onPriorityChange}
                    placeholder={translate("searchByPriority")}
                  />
                </EuiFormControlLayout>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              display="base"
              iconType="refresh"
              size="s"
              isLoading={isLoading}
              onClick={() => clearAllFilters()}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiTabs>{renderTabs()}</EuiTabs>
        {isLoading ? (
          <div>{translate("loading")}</div>
        ) : (
          <>
            <EuiSpacer size="xl" />
            <EuiText size="xs">
              <strong>Нийт</strong>
              {resultsCount}
            </EuiText>
            <EuiSpacer size="s" />
            <EuiHorizontalRule margin="none" style={{ height: 2 }} />
            <EuiBasicTable
              tableCaption="Campaign table"
              items={data?.results || []}
              columns={columns}
              rowProps={getRowProps}
              cellProps={getCellProps}
              pagination={
                data?.total_pages > 1
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
          </>
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default Table;
