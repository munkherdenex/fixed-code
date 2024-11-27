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
  EuiImage,
  EuiTableFieldDataColumnType,
  EuiTextColor,
} from "@elastic/eui";
import moment from "moment";
import { useRouter } from "next/router";
import { useLayoutEffect, useMemo, useState } from "react";
import { PAGINATION_CHOOSES } from "../../constants";
import useGetCustomers, { CustomersResponse, CustomersType } from "../../hooks/useGetCustomers";
import { isNumber } from "../../utils/helper";
import CreateCustomerFlyoutContainer from "./create_customer_flyout_container";
import { useTranslations } from "next-intl";

const pathPrefix = process.env.PATH_PREFIX;

const CustomersTable = () => {
  const audienceT = useTranslations();
  const router = useRouter();
  const { query } = router;

  const querySearch = query?.search?.toString() || "";
  const queryPageIndex = isNumber(query?.pageIndex) ? +query?.pageIndex : 0;
  const queryPageSize = isNumber(query?.pageSize) ? +query?.pageSize : PAGINATION_CHOOSES[2];

  const [searchValue, setSearchValue] = useState(querySearch);
  const [pageIndex, setPageIndex] = useState(queryPageIndex);
  const [pageSize, setPageSize] = useState(queryPageSize);

  const { data, isLoading, mutate } = useGetCustomers<CustomersResponse>(null, {
    query: searchValue,
    limit: `${pageSize}`,
    offset: `${pageIndex * pageSize}`,
  });

  // Memoizing pagination config
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
      pageSizeOptions: PAGINATION_CHOOSES,
    }),
    [pageIndex, pageSize],
  );

  // Memoizing columns to prevent unnecessary re-renders
  const columns = useMemo(
    (): Array<EuiBasicTableColumn<CustomersType>> => [
      {
        field: "email",
        name: audienceT("email"),
        render: (email: CustomersType["email"]) => (
          <>{email ? email : <EuiTextColor color="subdued">None</EuiTextColor>}</>
        ),
      },
      {
        field: "phone",
        name: audienceT("phone"),
        render: (phone: CustomersType["phone"]) => (
          <>{phone ? phone : <EuiTextColor color="subdued">None</EuiTextColor>}</>
        ),
      },
      {
        field: "rid",
        name: audienceT("rid"),
        render: (rid: CustomersType["rid"]) => (
          <>{rid ? rid : <EuiTextColor color="subdued">None</EuiTextColor>}</>
        ),
      },
      {
        field: "source",
        name: audienceT("source"),
        render: (source: CustomersType["source"]) => (
          <EuiBadge
            iconType={
              source === "web" ? "logoWebhook" : source === "import" ? "importAction" : "apps"
            }
            color={source === "web" ? "hollow" : ""}
          >
            {source}
          </EuiBadge>
        ),
      },
      {
        field: "created_by",
        name: audienceT("created-by"),
        mobileOptions: { enlarge: true },
      },
      {
        field: "created_at",
        name: audienceT("created-at"),
        align: "right",
        render: (date: string) => moment(date).format("YYYY-MM-DD LT"),
        footer: () => (
          <strong>
            {audienceT("total-audience")}: {data?.total_count || 0}
          </strong>
        ),
        mobileOptions: { enlarge: true },
      },
    ],
    [data?.total_count, audienceT],
  );

  const onTableChange = ({ page }: Criteria<CustomersType>) => {
    if (page) {
      const { index: newPageIndex, size: newPageSize } = page;
      router.push({
        query: { pageIndex: newPageIndex, pageSize: newPageSize, search: searchValue },
      });
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const onSearchEmailAddress = (value: string) => {
    setSearchValue(value);
    router.push({ query: { search: value } });
  };

  const getRowProps = (customer: CustomersType) => ({
    className: "customRowClass",
    onClick: () => router.push(`${pathPrefix}/dashboards/cdp/audience/info/${customer.id}`),
  });

  const getCellProps = (
    _customer: CustomersType,
    _column: EuiTableFieldDataColumnType<CustomersType>,
  ) => ({
    className: "customCellClass",
    textOnly: true,
  });

  // Condensed useEffect logic to update states when query parameters change
  useLayoutEffect(() => {
    if (querySearch !== searchValue) {
      setSearchValue(querySearch);
    }
    if (queryPageIndex !== pageIndex) {
      setPageIndex(queryPageIndex);
    }
    if (queryPageSize !== pageSize) {
      setPageSize(queryPageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryPageIndex, queryPageSize, querySearch]);

  if (isLoading) {
    return <div>{audienceT("loading")}</div>;
  }

  if (data?.results?.length === 0 && !searchValue && pageIndex === 0) {
    return (
      <EuiEmptyPrompt
        icon={<EuiImage size="s" src="/images/home/empty.png" alt="" />}
        title={<h2>Create your audience</h2>}
        layout="horizontal"
        color="plain"
        body={<p>{audienceT("the-audience-description")}</p>}
        actions={<CreateCustomerFlyoutContainer />}
      />
    );
  }

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiFlexGroup
          responsive={false}
          justifyContent="spaceBetween"
          alignItems="flexEnd"
          gutterSize="s"
        >
          <EuiFlexItem grow={false}>
            <EuiFieldSearch
              defaultValue={searchValue}
              onSearch={onSearchEmailAddress}
              placeholder={audienceT("search-audience")}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              iconType="refresh"
              display="base"
              size="s"
              isLoading={isLoading}
              onClick={() => mutate()}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiBasicTable
          tableLayout="auto"
          items={data?.results || []}
          columns={columns}
          rowProps={getRowProps}
          cellProps={getCellProps}
          pagination={
            data?.total_count > pageSize
              ? { ...pagination, totalItemCount: data?.total_count || 0 }
              : null
          }
          onChange={onTableChange}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default CustomersTable;
