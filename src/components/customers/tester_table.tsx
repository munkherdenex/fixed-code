import {
  Criteria,
  EuiBadge,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiConfirmModal,
  EuiEmptyPrompt,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiImage,
  EuiTableFieldDataColumnType,
  EuiTextColor,
} from "@elastic/eui";
import { useRouter } from "next/router";
import { Fragment, useEffect, useMemo, useState } from "react";
import { PAGINATION_CHOOSES } from "../../constants";
import useGetTesterCustomers from "../../hooks/useGetTesterCustomers";
import { isNumber } from "../../utils/helper";
import CreateCustomerFlyoutContainer from "./create_customer_flyout_container";
import { useTranslations } from "next-intl";
import { CustomersResponse, CustomersType } from "../../hooks/useGetCustomers";
import audienceApi from '../../api/audience';
import Link from 'next/link';

const pathPrefix = process.env.PATH_PREFIX;

const RemoveTestUserModal = ({ customer, onCancel, onConfirm }) => {
  const translate = useTranslations();

  return (
    <Fragment>
      <EuiConfirmModal
        title={translate("warning")}
        onCancel={onCancel}
        onConfirm={onConfirm}
        cancelButtonText={translate("cancel")}
        confirmButtonText={translate("yes-remove")}
        buttonColor="danger"
        defaultFocusedButton="confirm"
      >
        <p>{translate("sure-to-remove-test-customer")}</p>
        <dl>
          <dt>{translate("email")}</dt>
          <dd>{customer?.email}</dd>
          <dt>{translate("phone")}</dt>
          <dd>{customer?.phone}</dd>
        </dl>
      </EuiConfirmModal>
    </Fragment>
  );
};

const TesterCustomersTable = () => {
  const translate = useTranslations();
  const router = useRouter();
  const { query } = router;
  const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);
  const [removingCustomer, setRemovingCustomer] = useState(null);

  const querySearch = query?.search?.toString() || "";
  const queryPageIndex = isNumber(query?.pageIndex) ? +query?.pageIndex : 1;
  const queryPageSize = isNumber(query?.pageSize) ? +query?.pageSize : PAGINATION_CHOOSES[2];

  const [searchValue, setSearchValue] = useState(querySearch);
  const [pageIndex, setPageIndex] = useState(queryPageIndex);
  const [pageSize, setPageSize] = useState(queryPageSize);

  const { data, isLoading, isValidating, mutate } = useGetTesterCustomers({
    query: searchValue,
    limit: `${pageSize}`,
    offset: `${pageIndex}`,
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
  const columns: Array<EuiBasicTableColumn<CustomersType>> = [
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
    {
      field: "rid",
      name: translate("rid"),
      render: (rid: CustomersType["rid"]) => (
        <>{rid ? rid : <EuiTextColor color="subdued">None</EuiTextColor>}</>
      ),
    },
    {
      field: "source",
      name: translate("source"),
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
      name: translate("created-by"),
      mobileOptions: { enlarge: true },
    },
    {
      name: translate("actions"),
      actions: [
        {
          name: "View",
          description: translate("view"),
          type: "icon",
          icon: "eye",
          color: "primary",
          onClick: (customer: CustomersType) => {
            router.push(`${pathPrefix}/dashboards/cdp/audience/info/${customer.id}`);
          },
        },
        {
          name: "Delete",
          description: translate("remove-from-tester-list"),
          type: "icon",
          icon: "minus",
          color: "danger",
          onClick: (customer: CustomersType) => {
            setRemovingCustomer(customer);
            setIsRemoveModalVisible(true);
          },
        },
      ],
    },
  ];

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
    // onClick: () => router.push(`${pathPrefix}/dashboards/cdp/audience/info/${customer.id}`),
  });

  const getCellProps = (
    _customer: CustomersType,
    _column: EuiTableFieldDataColumnType<CustomersType>,
  ) => ({
    // className: "customCellClass",
    // textOnly: true,
  });

  // Condensed useEffect logic to update states when query parameters change
  useEffect(() => {
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

  if (isLoading || isValidating) {
    return <div>{translate("loading")}</div>;
  }

  if (data?.results?.length === 0 && !searchValue && pageIndex === 0) {
    return (
      <EuiEmptyPrompt
        icon={<EuiImage size="s" src="/images/home/empty.png" alt="" />}
        title={<h2>{translate("empty-title")}</h2>}
        layout="horizontal"
        color="plain"
        body={<p>{translate("description-to-add-test-audience")}</p>}
        actions={<Link href="/dashboards/cdp/audience">{translate("to-audience-page")}</Link>}
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
              placeholder={translate("search-audience")}
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
      {isRemoveModalVisible && (
        <RemoveTestUserModal
          customer={removingCustomer}
          onCancel={() => setIsRemoveModalVisible(false)}
          onConfirm={() => {
            audienceApi.removeTestAudience([null, removingCustomer]);
            mutate((prevData) => {
              if (!prevData) return prevData

              const newResult = prevData?.results?.filter((cc) => cc.id !== removingCustomer.id)

              return { ...prevData, results: newResult }
            }, false)
            setIsRemoveModalVisible(false)
          }}
        />
      )}
    </EuiFlexGroup>
  );
};

export default TesterCustomersTable;
