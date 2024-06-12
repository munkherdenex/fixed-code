import { EuiBasicTable, EuiBasicTableColumn, EuiTableFieldDataColumnType, formatDate } from "@elastic/eui";
import { useRouter } from "next/router";

type User = {
  id: string;
  email: string;
  phone: string;
  created_at: Date;
  latitute: number;
  longitute: number;
  last_ip: string;
};

const users: User[] = [];

for (let i = 0; i < 10; i++) {
  users.push({
    id: `${i}`,
    email: `${i}@gmail.com`,
    phone: "a",
    created_at: new Date(),
    last_ip: "192.168.10.1",
    latitute: 0,
    longitute: 0,
  });
}

const pathPrefix = process.env.PATH_PREFIX;

const CustomersTable = () => {
  const router = useRouter();
  const columns: Array<EuiBasicTableColumn<User>> = [
    {
      field: "id",
      name: "ID",
      "data-test-subj": "idCell",
      mobileOptions: {
        render: (user: User) => <>{user.id}</>,
        enlarge: true,
      },
    },
    {
      field: "email",
      name: "Email",
      "data-test-subj": "emailCell",
      mobileOptions: {
        render: (user: User) => <>{user.email}</>,
        enlarge: true,
      },
    },
    {
      field: "phone",
      name: "Phone",
      "data-test-subj": "phoneCell",
      mobileOptions: {
        render: (user: User) => <>{user.phone}</>,
        enlarge: true,
      },
    },
    {
      field: "last_ip",
      name: "Last ip",
      "data-test-subj": "lastIpCell",
      mobileOptions: {
        render: (user: User) => <>{user.last_ip}</>,
        enlarge: true,
      },
    },
    {
      field: "created_at",
      name: "Created at",
      "data-test-subj": "createdAtCell",
      mobileOptions: {
        render: (user: User) => formatDate(user.created_at, "createdAt"),
        enlarge: true,
      },
    },
  ];

  const getRowProps = (user: User) => {
    const { id } = user;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/customers/info/${id}`);
      },
    };
  };

  const getCellProps = (user: User, column: EuiTableFieldDataColumnType<User>) => {
    const { id } = user;
    const { field } = column;

    return {
      className: "customCellClass",
      "data-test-subj": `cell-${id}-${String(field)}`,
      textOnly: true,
    };
  };

  return (
    <EuiBasicTable
      tableCaption="Demo of EuiBasicTable"
      items={users}
      rowHeader="firstName"
      columns={columns}
      rowProps={getRowProps}
      cellProps={getCellProps}
    />
  );
};

export default CustomersTable;
