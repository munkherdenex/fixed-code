import { EuiBasicTable, EuiBasicTableColumn, EuiTableFieldDataColumnType } from "@elastic/eui";
import { useRouter } from "next/router";
import useGetCustomers, { CustomersResponse, CustomersType } from "../../hooks/useGetCustomers";
import moment from "moment";

const pathPrefix = process.env.PATH_PREFIX;

const CustomersTable = () => {
  const router = useRouter();
  const { data } = useGetCustomers<CustomersResponse>();

  const columns: Array<EuiBasicTableColumn<CustomersType>> = [
    {
      field: "id",
      name: "ID",
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

  const getRowProps = (customer: CustomersType) => {
    const { id } = customer;
    return {
      className: "customRowClass",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/customers/info/${id}`);
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
    <EuiBasicTable
      tableCaption="Demo of EuiBasicTable"
      items={data?.results || []}
      rowHeader="firstName"
      columns={columns}
      rowProps={getRowProps}
      cellProps={getCellProps}
    />
  );
};

export default CustomersTable;
