import {
  EuiBasicTableColumn,
  EuiTableFieldDataColumnType,
  EuiBasicTable,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonIcon,
  Criteria,
  EuiEmptyPrompt,
  EuiImage,
  EuiFlexGrid,
  EuiSelect,
  EuiBadge,
  EuiTextColor,
  EuiIcon,
} from "@elastic/eui";
import { useRouter } from "next/router";
import useGetChannels, { Channels, ChannelsResponse } from "../../hooks/useGetChannels";
import { useLayoutEffect, useState } from "react";
import { PAGINATION_CHOOSES } from "../../constants";
import moment from "moment";
import CreateChannelFlyoutContainer from "./create_channel_flyout_container";
import { isNumber } from "../../utils/helper";
import { useTranslations } from "next-intl";
import { badgeColor } from "../../utils/badge_color";

const pathPrefix = process.env.PATH_PREFIX;

const options = [
  { value: "", text: "All" },
  { value: "email", text: "email" },
  { value: "push", text: "push" },
  { value: "sms", text: "sms" },
  { value: "inapp", text: "inapp" },
  { value: "api", text: "api" },
];

const ChannelsTable = () => {
  const router = useRouter();
  const { query } = router;
  const translate = useTranslations();

  const querySearch = query?.search?.toString() || "";
  const queryFilter = query?.filter?.toString() || "";
  const queryPageIndex = isNumber(query?.pageIndex) ? +query?.pageIndex : 1;
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

  const { data, isLoading, mutate } = useGetChannels<ChannelsResponse>(undefined, {
    filter: filter,
    query: searchValue,
    offset: `${pageIndex}`,
    limit: `${pageSize}`,
  });

  const columns: Array<EuiBasicTableColumn<Channels>> = [
    {
      field: "name",
      name: translate("name"),
      "data-test-subj": "nameCell",
    },
    {
      field: "channel_type",
      name: translate("channel_type"),
      "data-test-subj": "descriptionCell",
      render: (channelType: string) => {
        return (
          <EuiTextColor color={badgeColor(channelType)}>
            <span>
              <EuiIcon aria-label="email" type="email" color={badgeColor(channelType)} />{" "}
              {channelType.toUpperCase()}
            </span>
          </EuiTextColor>
        );
      },
    },
    {
      field: "created_at",
      name: translate("created_at"),
      "data-test-subj": "createdAtCell",
      render: (date: string) => {
        return moment(date).format("YYYY-MM-DD LT");
      },
      footer: () => {
        return (
          <strong>
            {translate("total")}: {data?.total_count || 0}
          </strong>
        );
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

  const onTableChange = ({ page }: Criteria<Channels>) => {
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

  const getRowProps = (channel: Channels) => {
    const { id } = channel;
    return {
      "data-test-subj": `row-${id}`,
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/cdp/channels/info/${id}`);
      },
    };
  };

  const getCellProps = (channel: Channels, column: EuiTableFieldDataColumnType<Channels>) => {
    const { id } = channel;
    const { field } = column;

    return {
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
        title={<h2>{translate("create_channel")}</h2>}
        layout="horizontal"
        color="plain"
        body={
          <>
            <p>{translate("create_channel_description")}</p>
          </>
        }
        actions={<CreateChannelFlyoutContainer />}
      />
    );
  }

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiFlexGroup responsive={false} justifyContent="spaceBetween" alignItems="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiFlexGrid columns={2}>
              <EuiFlexItem grow={false}>
                <EuiFieldSearch
                  defaultValue={searchValue}
                  onSearch={onSearch}
                  placeholder={translate("search")}
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
                    pageIndex: 0,
                    pageSize: 0,
                  }
            }
            onChange={onTableChange}
          />
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default ChannelsTable;
