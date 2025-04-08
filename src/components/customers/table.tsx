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
  EuiSelect,
  EuiTableFieldDataColumnType,
  EuiTextColor,
  useGeneratedHtmlId,
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
  const options = [
    { value: "phone", text: "Утасны дугаар" },
    { value: "email", text: "И-мэйл" },
  ];

  const translate = useTranslations();
  const router = useRouter();
  const { query } = router;

  const querySearch = query?.search?.toString() || "";
  const queryPageIndex = isNumber(query?.pageIndex) ? +query?.pageIndex : 0;
  const queryPageSize = isNumber(query?.pageSize) ? +query?.pageSize : PAGINATION_CHOOSES[2];

  const [selectValue, setSelectValue] = useState(options[0].value);
  const [searchValue, setSearchValue] = useState(querySearch);
  const [pageIndex, setPageIndex] = useState(queryPageIndex);
  const [pageSize, setPageSize] = useState(queryPageSize);

  const basicSelectId = useGeneratedHtmlId({ prefix: "basicSelect" });

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
        field: "last_name",
        name: translate("last_name"),
        render: (email: CustomersType["last_name"]) => (
          <>{email ? email : <EuiTextColor color="subdued">None</EuiTextColor>}</>
        ),
      },
      {
        field: "name",
        name: translate("name"),
        render: (email: CustomersType["name"]) => (
          <>{email ? email : <EuiTextColor color="subdued">None</EuiTextColor>}</>
        ),
      },
      {
        field: "email",
        name: translate("email"),
        render: (email: CustomersType["email"]) => (
          <>{email ? email : <EuiTextColor color="subdued">None</EuiTextColor>}</>
        ),
      },
      {
        field: "phone",
        name: translate("phone"),
        render: (phone: CustomersType["phone"]) => (
          <>{phone ? phone : <EuiTextColor color="subdued">None</EuiTextColor>}</>
        ),
      },
      // {
      //   field: "rid",
      //   name: translate("rid"),
      //   render: (rid: CustomersType["rid"]) => (
      //     <>{rid ? rid : <EuiTextColor color="subdued">None</EuiTextColor>}</>
      //   ),
      // },
      // {
      //   field: "source",
      //   name: translate("source"),
      //   render: (source: CustomersType["source"]) => (
      //     <EuiBadge
      //       iconType={
      //         source === "web" ? "logoWebhook" : source === "import" ? "importAction" : "apps"
      //       }
      //       color={source === "web" ? "hollow" : ""}
      //     >
      //       {source}
      //     </EuiBadge>
      //   ),
      // },
      // {
      //   field: "created_by",
      //   name: translate("created-by"),
      //   mobileOptions: { enlarge: true },
      //   render: (worker: { id: BigInteger; email: string }) => worker?.email,
      // },
      // {
      //   field: "created_at",
      //   name: translate("created-at"),
      //   align: "right",
      //   render: (date: string) => moment(date).format("YYYY-MM-DD LT"),
      //   footer: () => (
      //     <strong>
      //       {translate("total-audience")}: {data?.total_count || 0}
      //     </strong>
      //   ),
      //   mobileOptions: { enlarge: true },
      // },
    ],
    [data?.total_count, translate],
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
    return <div>{translate("loading")}</div>;
  }

  if (data?.results?.length === 0 && !searchValue && pageIndex === 0) {
    return (
      <EuiEmptyPrompt
        icon={<EuiImage size="s" src="/images/home/empty.png" alt="" />}
        title={<h2>Create your audience</h2>}
        layout="horizontal"
        color="plain"
        body={<p>{translate("the-audience-description")}</p>}
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
            <EuiFlexGroup
              responsive={false}
              justifyContent="spaceBetween"
              alignItems="flexEnd"
              gutterSize="s"
            >
              <EuiFlexItem grow={false}>
                <EuiFormRow label="Хайх талбар">
                  <EuiSelect
                    id={basicSelectId}
                    options={options}
                    value={selectValue}
                    onChange={(e) => setSelectValue(e.target.value)}
                    aria-label="Хайлт хийх төрөл"
                  />
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFormRow hasEmptyLabelSpace>
                  <EuiFieldSearch
                    defaultValue={searchValue}
                    onSearch={onSearchEmailAddress}
                    placeholder={
                      selectValue == "phone"
                        ? translate("search-audience-phone")
                        : translate("search-audience-email")
                    }
                  />
                </EuiFormRow>
              </EuiFlexItem>
            </EuiFlexGroup>
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
