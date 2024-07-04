import {
  EuiBadge,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButtonIcon,
  EuiFieldSearch,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiTableFieldDataColumnType,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import useGetCustomers, { CustomersResponse, CustomersType } from "../../hooks/useGetCustomers";

const pathPrefix = process.env.PATH_PREFIX;

const schema = yup.object({
  search: yup.string().notRequired(),
});

const CustomersTable = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const { data, isLoading, mutate } = useGetCustomers<CustomersResponse>(null, {
    query: searchValue,
  });

  const {
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const columns: Array<EuiBasicTableColumn<CustomersType>> = [
    {
      field: "id",
      name: "ID",
      width: "8%",
      mobileOptions: {
        render: (customer: CustomersType) => <>{customer.id}</>,
        enlarge: true,
      },
    },
    {
      field: "email",
      name: "Email address",
      mobileOptions: {
        render: (customer: CustomersType) => <>{customer.email}</>,
        enlarge: true,
      },
    },
    {
      field: "phone",
      name: "Phone number",
      mobileOptions: {
        render: (customer: CustomersType) => <>{customer.phone}</>,
        enlarge: true,
      },
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
        render: (customer: CustomersType) => <>{customer.created_by}</>,
        enlarge: true,
      },
    },
    {
      field: "created_at",
      name: "Created at",
      mobileOptions: {
        render: (customer: CustomersType) =>
          moment(customer.created_at).format("YYYY-MM-DD hh:mm:ss"),
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

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="flexEnd" gutterSize="s">
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
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default CustomersTable;
