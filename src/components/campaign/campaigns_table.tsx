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
  EuiIcon,
  EuiImage,
  EuiNotificationBadge,
  EuiSelect,
  EuiSpacer,
  EuiTab,
  EuiTableFieldDataColumnType,
  EuiTabs,
  EuiText,
  EuiTextColor,
} from "@elastic/eui";
import moment from "moment";
import { useRouter } from "next/router";
import { Fragment, useLayoutEffect, useMemo, useState } from "react";
import { PAGINATION_CHOOSES } from "../../constants";
import useGetTemplates, { Template, TemplateResponse } from "../../hooks/useGetTemplates";
import { badgeColor } from "../../utils/badge_color";
import { getCampaignIcon, getCampaignStatusIcon, getDataKind, isNumber } from "../../utils/helper";
import CreateCampaignActionPopover from "./create_campaign_action_popover";
import { useTranslations } from "next-intl";

const options = [
  { value: "", text: "All" },
  { value: "DRAFT", text: "DRAFT" },
  { value: "APPROVED", text: "APPROVED" },
  { value: "DONE", text: "DONE" },
  { value: "STOPPED", text: "STOPPED" },
  { value: "SENT", text: "SENT" },
  { value: "ERROR", text: "ERROR" },
  { value: "SCHEDULED", text: "SCHEDULED" },
  { value: "RECURRING", text: "RECURRING" },
];

const CampaignsTable = () => {
  const router = useRouter();
  const { query } = router;
  const translate = useTranslations();

  const querySearch = query?.search?.toString() || "";
  const queryFilter = query?.filter?.toString() || "";
  const queryPageIndex = isNumber(query?.pageIndex) ? +query?.pageIndex : 0;
  const queryPageSize = isNumber(query?.pageSize) ? +query?.pageSize : PAGINATION_CHOOSES[1];

  const [searchValue, setSearchValue] = useState(querySearch);
  const [pageIndex, setPageIndex] = useState(queryPageIndex);
  const [pageSize, setPageSize] = useState(queryPageSize);
  const [filter, setFilter] = useState(queryFilter);

  const [selectedTabId, setSelectedTabId] = useState("all-tab--id");

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

  const pagination = {
    pageIndex,
    pageSize,
    pageSizeOptions: PAGINATION_CHOOSES,
  };

  const { data, isLoading, mutate } = useGetTemplates<TemplateResponse>(undefined, {
    query: searchValue,
    status: filter,
    offset: `${pageIndex * pageSize}`,
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
      name: translate("click_rate"),
      render: (template: Template) => {
        return (template.status == "DRAFT" || template.status == "DONE") ? "-" : Math.random().toFixed(2);
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
                    {translate("done")}
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

export default CampaignsTable;
