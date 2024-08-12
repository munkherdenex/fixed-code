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
  EuiFormRow,
  EuiImage,
  EuiTableFieldDataColumnType,
  EuiTextColor,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { PAGINATION_CHOOSES } from "../../constants";
import useGetCustomers, { CustomersResponse, CustomersType } from "../../hooks/useGetCustomers";

const pathPrefix = process.env.PATH_PREFIX;

const schema = yup.object({
  search: yup.string().notRequired().label("Search"),
});

const CustomersTable = ({ openCreateChannelFlyout }: { openCreateChannelFlyout: () => void }) => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, mutate } = useGetCustomers<CustomersResponse>(null, {
    query: searchValue,
    limit: `${pageSize}`,
    offset: `${pageIndex * pageSize}`,
  });

  const pagination = {
    pageIndex,
    pageSize,
    pageSizeOptions: PAGINATION_CHOOSES,
  };

  const {
    control,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
  });

  const onTableChange = ({ page }: Criteria<CustomersType>) => {
    if (page) {
      const { index: pageIndex, size: pageSize } = page;
      setPageIndex(pageIndex);
      setPageSize(pageSize);
    }
  };

  const columns: Array<EuiBasicTableColumn<CustomersType>> = [
    {
      field: "email",
      name: "Email address",
      render: (email: CustomersType["email"]) => (
        <>{email ? email : <EuiTextColor color="subdued">None</EuiTextColor>}</>
      ),
    },
    {
      field: "phone",
      name: "Phone number",
      render: (phone: CustomersType["phone"]) => (
        <>{phone ? phone : <EuiTextColor color="subdued">None</EuiTextColor>}</>
      ),
    },
    {
      field: "rid",
      name: "Reference ID",
      render: (rid: CustomersType["rid"]) => (
        <>{rid ? rid : <EuiTextColor color="subdued">None</EuiTextColor>}</>
      ),
    },
    {
      field: "source",
      name: "Source",
      render: (source: CustomersType["source"]) => (
        <>
          <EuiBadge
            iconType={source === "web" ? "logoWebhook" : "apps"}
            color={source === "web" ? "hollow" : ""}
          >
            {source}
          </EuiBadge>
        </>
      ),
    },
    {
      field: "created_by",
      name: "Created by",
      mobileOptions: {
        enlarge: true,
      },
    },
    {
      field: "created_at",
      name: "Created at",
      align: "right",
      render: (date: string) => {
        return moment(date).format("YYYY-MM-DD LT");
      },
      footer: () => {
        return <strong>Total: {data?.total_count || 0}</strong>;
      },
      mobileOptions: {
        enlarge: true,
      },
    },
  ];

  const onSearchEmailAddress = (value: string) => {
    setSearchValue(value);
  };

  const getRowProps = (customer: CustomersType) => {
    const { id } = customer;
    return {
      className: "customRowClass",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/audience/info/${id}`);
      },
    };
  };

  const getCellProps = (
    _customer: CustomersType,
    _column: EuiTableFieldDataColumnType<CustomersType>,
  ) => {
    return {
      className: "customCellClass",
      textOnly: true,
    };
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (data?.results?.length === 0 && searchValue === "") {
    return (
      <EuiEmptyPrompt
        icon={<EuiImage size="s" src="/images/home/empty.png" alt="" />}
        title={<h2>Create your audience</h2>}
        layout="horizontal"
        color="plain"
        body={
          <>
            <p>The audience description</p>
          </>
        }
        actions={
          <EuiButton
            color="primary"
            fill
            onClick={() => {
              openCreateChannelFlyout();
            }}
          >
            Create audience
          </EuiButton>
        }
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
          <EuiFlexGrid columns={2}>
            <EuiFlexItem grow={false}>
              <EuiFormRow
                label="Search"
                isInvalid={!!errors.search?.message}
                error={[errors.search?.message]}
              >
                <Controller
                  control={control}
                  name="search"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <EuiFieldSearch
                      onChange={onChange}
                      value={value}
                      onBlur={onBlur}
                      onSearch={onSearchEmailAddress}
                      placeholder="Search email or phone"
                      isInvalid={!!errors.search?.message}
                    />
                  )}
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGrid>
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
          items={data?.results || []}
          columns={columns}
          rowProps={getRowProps}
          cellProps={getCellProps}
          pagination={
            data?.total_count > pageSize
              ? {
                  ...pagination,
                  totalItemCount: data?.total_count || 0,
                }
              : {
                  totalItemCount: 0,
                  pageSize: 0,
                  pageIndex: 0,
                }
          }
          onChange={onTableChange}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default CustomersTable;
