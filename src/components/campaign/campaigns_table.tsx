import {
  Criteria,
  EuiBadge,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButtonIcon,
  EuiEmptyPrompt,
  EuiComboBox,
  EuiFieldSearch,
  EuiDatePickerRange,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiDatePicker,
  EuiFlexItem,
  EuiProvider,
  EuiContext,
  EuiIcon,
  EuiImage,
  EuiComboBoxOptionOption,
  EuiSelect,
  EuiTab,
  EuiTableFieldDataColumnType,
  EuiTabs,
  EuiTextColor,
} from "@elastic/eui";
import moment from "moment";
import { useRouter } from "next/router";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { PAGINATION_CHOOSES } from "../../constants";
import useGetTemplates, { Template, TemplateResponse } from "../../hooks/useGetTemplates";
import { badgeColor } from "../../utils/badge_color";
import { getCampaignIcon, getCampaignStatusIcon, getDataKind, isNumber } from "../../utils/helper";
import CreateCampaignActionPopover from "./create_campaign_action_popover";
import { useTranslations } from "next-intl";
import useAllWorkers from "@/hooks/useAllWorkers";
import { Worker } from "@/lib/types";
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

const options = [
  { value: "", text: "Бүгд" },
  { value: "email", text: "И-мэйл" },
  { value: "sms", text: "Мессеж" },
  { value: "push", text: "PUSH" },
  { value: "api", text: "API" },
];

const CampaignsTable = () => {
  const currentTeamId = typeof window !== "undefined" ? localStorage.getItem("currentTeamId") : null;
  const { data: teamData, isLoading: workersLoading } = useAllWorkers<{ workers: Worker[] }>(currentTeamId);
  const workers = teamData?.workers || [];

  const workerOptions: Array<EuiComboBoxOptionOption<string>> = workers.map((worker) => ({
    label: worker.user?.email || worker.email || "Unknown",
    value: String(worker.id),
  }));

  const router = useRouter();
  const { query } = router;
  const translate = useTranslations();

  const querySearch = query?.search?.toString() || "";
  const queryFilter = query?.filter?.toString() || "";
  const queryKindFilter = query?.kind?.toString() || "";
  const queryCreatedBy = query?.created_by?.toString() || "";
  const queryCreatedAt = query?.created_at?.toString() || "";
  const queryPageIndex = isNumber(query?.pageIndex) ? +query?.pageIndex : 1;
  const queryPageSize = isNumber(query?.pageSize) ? +query?.pageSize : PAGINATION_CHOOSES[1];

  const [searchValue, setSearchValue] = useState(querySearch);
  const [pageIndex, setPageIndex] = useState(queryPageIndex);
  const [pageSize, setPageSize] = useState(queryPageSize);
  const [filter, setFilter] = useState(queryFilter);
  const [kindFilter, setKindFilter] = useState(queryKindFilter);
  const [createdBy, setCreatedBy] = useState(queryCreatedBy);
  const [createdAt, setCreatedAt] = useState<moment.Moment | null>(
    queryCreatedAt ? moment(queryCreatedAt) : null
  );
  const [startDate, setStartDate] = useState<moment.Moment | null>(null);
  const [endDate, setEndDate] = useState<moment.Moment | null>(null);
  const isDatePickerChange = useRef(false);

  const [selectedTabId, setSelectedTabId] = useState(query?.tab || "all-tab--id");

  const tabs = [
    {
      id: "all-tab--id",
      name: translate("all"),
    },
    {
      id: "draft-tab--id",
      name: translate("draft"),
    },
    {
      id: "done-tab--id",
      name: translate("done"),
    },
    {
      id: "active-tab--id",
      name: translate("active"),
    },
    {
      id: "stopped-tab--id",
      disabled: false,
      name: translate("stopped"),
    },
  ];

  const pagination = useMemo(
    () => ({
      pageIndex: pageIndex - 1,
      pageSize,
      pageSizeOptions: PAGINATION_CHOOSES,
    }),
    [pageIndex, pageSize],
  );

  const { data, isLoading, mutate } = useGetTemplates<TemplateResponse>(undefined, {
    query: searchValue,
    status: filter,
    kind: kindFilter,
    created_by: createdBy,
    start_date: startDate ? startDate.format("YYYY-MM-DD") : undefined,
    end_date: endDate ? endDate.format("YYYY-MM-DD") : undefined,
    offset: `${pageIndex}`,
    limit: `${pageSize}`,
  });

  const columns: Array<EuiBasicTableColumn<Template>> = [
    {
      field: "title",
      name: translate("title"),
      "data-test-subj": "titleCell",
    },
    {
      name: translate("kind"),
      "data-test-subj": "kindCell",
      render: (template: Template) => {
        //INFO: This is a workaround to get the kind of the template becaouse of POCKET
        const dataKind = getDataKind(template);

        return (
          <span>
            <EuiIcon
              aria-label={dataKind}
              type={getCampaignIcon(dataKind)}
              color={badgeColor(dataKind)}
            />{" "}
            <EuiTextColor color={badgeColor(dataKind)}>{dataKind.toUpperCase()}</EuiTextColor>
          </span>
        );
      },
    },
    {
      name: translate("status"),
      render: (template: Template) => {
        const { status, start_date, is_recurring } = template;

        const iconType = getCampaignStatusIcon(start_date != null, is_recurring);

        return (
          <span>
            <EuiIcon type={iconType} color={badgeColor(status)} />{" "}
            <EuiBadge color={badgeColor(status)}>{status}</EuiBadge>
          </span>
        );
      },
    },
    {
      name: translate("aud_count"),
      render: (template: Template) => {
        const { is_to_all, aud_count } = template;

        return <span>{is_to_all ? translate("all_customer") : aud_count}</span>;
      },
    },
    {
      name: translate("click_count"),
      render: (template: Template) => {
        return template.status == "DRAFT" || template.status == "DONE" ? "-" : template.click_count;
      },
    },
    {
      field: "created_at",
      name: translate("created_at"),
      "data-test-subj": "createdAtCell",
      render: (date: string) => {
        return moment(date).format("YYYY-MM-DD LT");
      },
    },
    {
      field: "created_by",
      name: translate("created_by"),
      "data-test-subj": "createdByCell",
      render: (worker: Worker) => worker?.email,
      footer: () => {
        return <strong>Нийт мэдэгдэл: {data?.total_count.toLocaleString() || 0}</strong>;
      },
    },
  ];

  const onSearch = (value: string) => {
    setSearchValue(value);
    router.push({
      query: {
        search: value,
        filter,
        kind: kindFilter,
        created_by: createdBy,
      }
    });
  };

  const onKindFilter = (value: string) => {
    setKindFilter(value);
    router.push({
      query: {
        kind: value,
        search: searchValue,
        filter,
        created_by: createdBy,
      },
    });
  };

  const onCreatedByFilter = (selected: EuiComboBoxOptionOption<string>[]) => {
    const value = selected[0]?.value ?? "";
    setCreatedBy(value);

    router.push({
      query: {
        search: searchValue,
        filter,
        kind: kindFilter,
        created_by: value,
      },
    });
  };

  const onDateRangeFilter = (start: moment.Moment | null, end: moment.Moment | null) => {
    console.log("Date range changed:", {
      start: start?.format("YYYY-MM-DD"),
      end: end?.format("YYYY-MM-DD"),
    });

    setStartDate(start);
    setEndDate(end);

    router.push({
      query: {
        ...query,
        start_date: start ? start.format("YYYY-MM-DD") : "",
        end_date: end ? end.format("YYYY-MM-DD") : "",
      },
    });
  };

const onTableChange = ({ page }: Criteria<Template>) => {
  if (page) {
    const { index, size } = page;
    const newPageIndex = index + 1; 
    const newPageSize = size;

    setPageIndex(newPageIndex);
    setPageSize(newPageSize);

    router.push({
      query: {
        pageIndex: newPageIndex,
        pageSize: newPageSize,
        filter,
        search: searchValue,
        kind: kindFilter,
        created_by: createdBy,
        start_date: startDate ? startDate.format("YYYY-MM-DD") : undefined,
        end_date: endDate ? endDate.format("YYYY-MM-DD") : undefined,
      },
    });
  }
};

  const getRowProps = (template: Template) => {
    const { id } = template;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => router.push(`/dashboards/cdp/campaign/info/${id}`),
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

  useLayoutEffect(() => {
    if (querySearch !== searchValue) setSearchValue(querySearch);
    if (queryFilter !== filter) setFilter(queryFilter);
    if (queryKindFilter !== kindFilter) setKindFilter(queryKindFilter);
    if (queryCreatedBy !== createdBy) setCreatedBy(queryCreatedBy);

    if (isNumber(query?.pageIndex) && pageIndex !== +query.pageIndex) {
      setPageIndex(+query.pageIndex);
    }
    if (isNumber(query?.pageSize) && pageSize !== +query.pageSize) {
      setPageSize(+query.pageSize);
    }

    if (query.start_date && (!startDate || !startDate.isSame(query.start_date, "day"))) {
      setStartDate(moment(query.start_date));
    }
    if (query.end_date && (!endDate || !endDate.isSame(query.end_date, "day"))) {
      setEndDate(moment(query.end_date));
    }
    if (isDatePickerChange.current) {
      isDatePickerChange.current = false;
    } else {
      if (queryCreatedAt && (!createdAt || !createdAt.isSame(queryCreatedAt, "day"))) {
        setCreatedAt(moment(queryCreatedAt));
      } else if (!queryCreatedAt && createdAt) {
        setCreatedAt(null);
      }
    }
  }, [query, querySearch, queryFilter, queryKindFilter, queryCreatedBy, queryCreatedAt]);

  if (isLoading) {
    return <div>{translate("loading")}</div>;
  }

  if (data?.results?.length === 0 && !searchValue && !filter && !createdBy) {
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
        actions={<CreateCampaignActionPopover />}
      />
    );
  }

  const onSelectedTabChanged = (tab: any) => {
    setSelectedTabId(tab.id);
    switch (tab.id) {
      case "all-tab--id": {
        setFilter("");
        break;
      }
      case "draft-tab--id": {
        setFilter("DRAFT");
        break;
      }
      case "done-tab--id": {
        setFilter("DONE");
        break;
      }
      case "active-tab--id": {
        setFilter("APPROVED,SCHEDULED,RECURRING,SENDING");
        break;
      }
      case "stopped-tab--id": {
        setFilter("SENT,ERROR,STOPPED,ENDED");
        break;
      }
    }
  };

  const renderTabs = () => {
    return tabs.map((tab, index) => (
      <EuiTab
        key={index}
        onClick={() => onSelectedTabChanged(tab)}
        isSelected={tab.id === selectedTabId}
      >
        {tab.name}
      </EuiTab>
    ));
  };

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
              <EuiFlexItem grow={false}>
                <EuiComboBox
                  singleSelection={{ asPlainText: true }}
                  placeholder={translate("search_by_worker")}
                  options={workerOptions}
                  selectedOptions={
                    createdBy ? workerOptions.filter((opt) => opt.value === createdBy) : []
                  }
                  onChange={onCreatedByFilter}
                  isLoading={workersLoading}
                />
              </EuiFlexItem>

              <EuiFlexItem grow={false}>
                <EuiDatePickerRange
                  startDateControl={
                    <EuiDatePicker
                      selected={startDate}
                      onChange={(date) => onDateRangeFilter(date, endDate)}
                      startDate={startDate}
                      endDate={endDate}
                      isInvalid={!!startDate && !!endDate && startDate.isAfter(endDate)}
                      placeholder={translate("start_date")}
                    />
                  }
                  endDateControl={
                    <EuiDatePicker
                      selected={endDate}
                      onChange={(date) => onDateRangeFilter(startDate, date)}
                      startDate={startDate}
                      endDate={endDate}
                      isInvalid={!!startDate && !!endDate && startDate.isAfter(endDate)}
                      placeholder={translate("end_date")}
                    />
                  }
                />
              </EuiFlexItem>

              <EuiFlexItem grow={false}>
                <EuiSelect
                  options={options}
                  value={kindFilter}
                  onChange={(e) => {
                    onKindFilter(e.target.value);
                  }}
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
                <EuiBasicTable
                  tableCaption="Campaign table"
                  items={data?.results || []}
                  columns={columns}
                  rowProps={getRowProps}
                  cellProps={getCellProps}
                  pagination={{
                    ...pagination,
                    totalItemCount: data?.total_count || 0,
                    showPerPageOptions: true,
                  }}
                  onChange={onTableChange}
                />
              )}
            </div>
          </EuiProvider>
        </EuiContext>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default CampaignsTable;
