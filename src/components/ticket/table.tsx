import {
  Criteria,
  EuiBadge,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButtonIcon,
  EuiDatePicker,
  EuiDatePickerRange,
  EuiFieldSearch,
  EuiFlexGrid,
  EuiContext,
  EuiProvider,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormControlLayout,
  EuiHorizontalRule,
  EuiInputPopover,
  EuiSelect,
  EuiSelectable,
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
import { css } from "@emotion/react";

const titleStyle = css`
  .euiTablePagination__PerPage {
    font-size: 0; 
  }

  .euiTablePagination__PerPage::before {
    content: "Хуудсанд харуулж буй мөрний тоо";
    font-size: 14px; 
  }
`;

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
  const queryStartDateSearch = query?.start_date?.toString() || null;
  const queryEndDateSearch = query?.end_date?.toString() || null;
  const queryFilter = query?.filter?.toString() || null;
  const queryStatusFilter = query?.status?.toString() || null;
  const queryTypeFilter = query?.tag?.toString() || null;
  const queryPriorityFilter = query?.priority?.toString() || null;
  const queryCreatedByFilter = query?.created?.toString() || null;
  const queryPageIndex = isNumber(query?.pageIndex) ? +query?.pageIndex : 1;
  const queryPageSize = isNumber(query?.pageSize) ? +query?.pageSize : 5;

  const [ticketCategory, setTicketCategory] = useState(queryCategory);
  const [searchValue, setSearchValue] = useState(querySearch);
  const [searchDateValue, setSearchDateValue] = useState(
    queryDateSearch ? moment(queryDateSearch) : null,
  );
  const [searchStartDateValue, setSearchStartDateValue] = useState(
    queryStartDateSearch ? moment(queryStartDateSearch) : null,
  );
  const [searchEndDateValue, setSearchEndDateValue] = useState(
    queryEndDateSearch ? moment(queryEndDateSearch) : null,
  );
  const [typeFilter, setTypeFilter] = useState(queryTypeFilter);
  const [statusFilter, setStatusFilter] = useState(queryStatusFilter);
  const [priorityFilter, setPriorityFilter] = useState(queryPriorityFilter);
  const [createdByFilter, setCreatedByFilter] = useState(queryCreatedByFilter);
  const [pageIndex, setPageIndex] = useState(queryPageIndex);
  const [pageSize, setPageSize] = useState(queryPageSize);
  const [filter, setFilter] = useState(queryFilter);

  const [selectedTabId, setSelectedTabId] = useState(query?.tab || "all-tab--id");
  const [tabs, setTabs] = useState(null);
  const [priorityOptions, setPriorityOptions] = useState([]);

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
    async function fetchPriorityList() {
      let { results } = await ticketApi.getPriorityList();
      const transformedData = results.map((item) => ({
        value: item.name,
        inputDisplay: item.name,
      }));
      setPriorityOptions(transformedData);
    }
    fetchData();
    fetchPriorityList();
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
      searchStartDateValue,
      searchEndDateValue,
      statusFilter,
      typeFilter,
      priorityFilter,
      createdByFilter,
      filter,
      pageIndex,
      pageSize,
    ],
    () =>
      ticketApi.getTickets({
        ...(ticketCategory && { category: ticketCategory }),
        description: searchValue,
        date: searchDateValue ? searchDateValue.format("YYYY-MM-DD") : null,
        start_date: searchStartDateValue ? searchStartDateValue.format("YYYY-MM-DD") : null,
        end_date: searchEndDateValue ? searchEndDateValue.format("YYYY-MM-DD") : null,
        status: statusFilter,
        tag: typeFilter,
        priority: priorityFilter,
        created_by: createdByFilter,
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
      field: "tags",
      name: "Төрөл",
      render: (tags) =>
        tags.length > 0 ? (
          <EuiFlexGroup direction="column" gutterSize="none">
            {tags.map((tag) => (
              <EuiFlexItem key={tag.id}>
                <EuiBadge color="hollow" style={{ marginRight: "4px", marginBottom: "4px" }}>
                  {tag.name}
                </EuiBadge>
              </EuiFlexItem>
            ))}
          </EuiFlexGroup>
        ) : null,
    },
    {
      field: "status",
      name: "Төлөв",
      render: (status) => (
        <EuiBadge color={status == "open" ? "success" : "danger"} iconType="dot">
          {status == "open" ? "Нээлттэй" : status == "processing" ? "Шалгагдаж байгаа" : "Хаалттай"}
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
          <EuiBadge color={prio.id == 1 ? "danger" : prio.id == 4 ? "warning" : "primary"}>
            {prio.name}
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

  const columnsAll: Array<EuiBasicTableColumn<any>> = [
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
        tags.length > 0 ? (
          <EuiFlexGroup direction="column" gutterSize="none">
            {tags.map((tag) => (
              <EuiFlexItem key={tag.id}>
                <EuiBadge color="hollow" style={{ marginRight: "4px", marginBottom: "4px" }}>
                  {tag.name}
                </EuiBadge>
              </EuiFlexItem>
            ))}
          </EuiFlexGroup>
        ) : null,
    },
    {
      field: "status",
      name: "Төлөв",
      render: (status) => (
        <EuiBadge
          color={status == "open" ? "success" : status == "processing" ? "warning" : "danger"}
          iconType="dot"
        >
          {status == "open" ? "Нээлттэй" : status == "processing" ? "Шалгагдаж байгаа" : "Хаалттай"}
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
          <EuiBadge color={prio.id == 1 ? "danger" : prio.id == 4 ? "warning" : "primary"}>
            {prio.name}
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

  const tabColumns = selectedTabId == "tab--0" ? columnsAll : columns;

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
          ...(createdByFilter && { createdBy: createdByFilter }),
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
        ...(createdByFilter && { createdBy: createdByFilter }),
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
        ...(createdByFilter && { createdBy: createdByFilter }),
      },
    });
  };
  const onStartDateSearch = (date: any) => {
    setSearchStartDateValue(date);
    router.push({
      query: {
        pageIndex: 1,
        start_date: moment(date).format("YYYY-MM-DD"),
        ...(searchEndDateValue && { end_date: searchEndDateValue.format("YYYY-MM-DD") }),
        ...(ticketCategory && { category: ticketCategory }),
        ...(searchValue && { description: searchValue }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { tag: typeFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
        ...(pageSize && { pageSize: 10 }),
        ...(createdByFilter && { createdBy: createdByFilter }),
      },
    });
  };
  const onEndDateSearch = (date: any) => {
    setSearchEndDateValue(date);
    router.push({
      query: {
        pageIndex: 1,
        end_date: moment(date).format("YYYY-MM-DD"),
        ...(searchStartDateValue && { start_date: searchStartDateValue.format("YYYY-MM-DD") }),
        ...(ticketCategory && { category: ticketCategory }),
        ...(searchValue && { description: searchValue }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { tag: typeFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
        ...(pageSize && { pageSize: 10 }),
        ...(createdByFilter && { createdBy: createdByFilter }),
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
        ...(createdByFilter && { createdBy: createdByFilter }),
      },
    });
  };
  const clearDateFilter = () => {
    setSearchDateValue(null);
    setSearchStartDateValue(null);
    setSearchEndDateValue(null);
    router.push({
      query: {
        pageIndex: 1,
        ...(searchValue && { description: searchValue }),
        ...(ticketCategory && { category: ticketCategory }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { tag: typeFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
        ...(pageSize && { pageSize: 10 }),
        ...(createdByFilter && { createdBy: createdByFilter }),
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
        ...(createdByFilter && { createdBy: createdByFilter }),
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
        ...(createdByFilter && { createdBy: createdByFilter }),
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
        ...(createdByFilter && { createdBy: createdByFilter }),
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
        ...(createdByFilter && { createdBy: createdByFilter }),
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
        ...(createdByFilter && { createdBy: createdByFilter }),
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
        ...(createdByFilter && { createdBy: createdByFilter }),
      },
    });
  };
  const onCreatedByChange = (createdBy) => {
    setCreatedByFilter(createdBy);
    router.push({
      query: {
        createdBy,
        pageIndex: 1,
        ...(ticketCategory && { category: ticketCategory }),
        ...(pageSize && { pageSize: 10 }),
        ...(searchValue && { description: searchValue }),
        ...(searchDateValue && { date: moment(searchDateValue).format("YYYY-MM-DD") }),
        ...(typeFilter && { tag: typeFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
      },
    });
  };
  const clearCreatedByFilter = () => {
    setCreatedByFilter(null);
    router.push({
      query: {
        pageIndex: 1,
        ...(ticketCategory && { category: ticketCategory }),
        ...(pageSize && { pageSize: 10 }),
        ...(searchValue && { description: searchValue }),
        ...(searchDateValue && { date: moment(searchDateValue).format("YYYY-MM-DD") }),
        ...(typeFilter && { tag: typeFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
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
    setCreatedByFilter(null);
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

  const SelectableInputPopover = ({ emitTagChange, systemTags }) => {
    const queryTypeFilter = query?.tag?.toString() || null;
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(queryTypeFilter);
    const [isSearching, setIsSearching] = useState(true);

    const tagsSelectOptions = useMemo(() => {
      if (!systemTags?.results) {
        return [];
      }
      return systemTags.results.map((tag: Tag) => ({
        value: tag.name,
        label: tag.name,
      }));
    }, [systemTags]);

    return (
      <EuiSelectable
        aria-label="Selectable + input popover example"
        options={tagsSelectOptions}
        onChange={(newOptions, event, changedOption) => {
          setIsOpen(false);
          if (changedOption.checked === "on") {
            setInputValue(changedOption.label);
            setIsSearching(false);
          } else {
            setInputValue("");
          }
          // Fix: use label property instead of value
          emitTagChange(changedOption.label);
        }}
        singleSelection
        searchable
        searchProps={{
          value: inputValue,
          onChange: (value) => {
            setInputValue(value);
            setIsSearching(true);
          },
          onKeyDown: (event) => {
            if (event.key === "Tab") return setIsOpen(false);
            if (event.key !== "Escape") return setIsOpen(true);
          },
          onClick: () => setIsOpen(true),
          onFocus: () => setIsOpen(true),
        }}
        isPreFiltered={isSearching ? false : { highlightSearch: false }} // Shows the full list when not actively typing to search
        listProps={{
          css: { ".euiSelectableList__list": { maxBlockSize: 200 } },
        }}
      >
        {(list, search) => (
          <EuiInputPopover
            closePopover={() => setIsOpen(false)}
            disableFocusTrap
            closeOnScroll
            isOpen={isOpen}
            input={search!}
            panelPaddingSize="none"
          >
            {list}
          </EuiInputPopover>
        )}
      </EuiSelectable>
    );
  };

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
                  {...(searchStartDateValue || searchEndDateValue
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
                  <EuiDatePickerRange
                    startDateControl={
                      <EuiDatePicker
                        selected={searchStartDateValue}
                        onChange={onStartDateSearch}
                        startDate={searchStartDateValue}
                        endDate={searchEndDateValue}
                        aria-label="Start date"
                      />
                    }
                    endDateControl={
                      <EuiDatePicker
                        selected={searchEndDateValue}
                        onChange={onEndDateSearch}
                        startDate={searchStartDateValue}
                        endDate={searchEndDateValue}
                        minDate={searchStartDateValue}
                        aria-label="End date"
                      />
                    }
                  />
                  {/* <EuiDatePicker
                    selected={searchDateValue}
                    onChange={onDateSearch}
                    placeholder={translate("date")}
                  /> */}
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
                  <SelectableInputPopover emitTagChange={onTypeChange} systemTags={systemTags} />
                  {/* <EuiSuperSelect
                    id={byTypeSelectId}
                    options={tagsSelectOptions}
                    valueOfSelected={typeFilter}
                    onChange={onTypeChange}
                    placeholder={translate("searchByType")}
                  /> */}
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
                      {
                        value: "processing",
                        inputDisplay: "Шалгагдаж байгаа",
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
                    options={priorityOptions}
                    valueOfSelected={priorityFilter}
                    onChange={onPriorityChange}
                    placeholder={translate("searchByPriority")}
                  />
                </EuiFormControlLayout>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFormControlLayout
                  {...(createdByFilter
                    ? {
                        clear: {
                          onClick: () => {
                            clearCreatedByFilter();
                          },
                          "aria-label": "Clear createdBy filter",
                        },
                      }
                    : null)}
                >
                  <EuiSuperSelect
                    id={byPrioritySelectId}
                    options={[
                      {
                        value: "me",
                        inputDisplay: "Миний",
                      },
                      {
                        value: "others",
                        inputDisplay: "Бусад",
                      },
                    ]}
                    valueOfSelected={createdByFilter}
                    onChange={onCreatedByChange}
                    placeholder={translate("searchByCreated")}
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
                <EuiContext
          i18n={{
            mapping: {
              'euiTablePagination.rowsPerPage': 'Хуудсанд харуулж буй мөрний тоо',
              'euiTablePagination.rowsPerPageOption': '{rowsPerPage} Мөр',
            },
          }}
        >

          <EuiProvider colorMode="light">
            <div css={titleStyle}>
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
              columns={tabColumns}
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
                    </div>
          </EuiProvider>
        </EuiContext>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default Table;
