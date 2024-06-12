import {
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiHealth,
  EuiLink,
  EuiTableFieldDataColumnType,
  formatDate,
} from "@elastic/eui";

type User = {
  id: string;
  firstName: string | null | undefined;
  lastName: string;
  github: string;
  dateOfBirth: Date;
  online: boolean;
  location: {
    city: string;
    country: string;
  };
};

const users: User[] = [];

for (let i = 0; i < 10; i++) {
  users.push({
    id: `${i}`,
    firstName: "a",
    lastName: "a",
    github: "a",
    dateOfBirth: new Date(),
    online: true,
    location: {
      city: "a",
      country: "a",
    },
  });
}

const SendsTable = () => {
  const columns: Array<EuiBasicTableColumn<User>> = [
    {
      field: "firstName",
      name: "First Name",
      "data-test-subj": "firstNameCell",
      mobileOptions: {
        render: (user: User) => (
          <>
            {user.firstName} {user.lastName}
          </>
        ),
        header: false,
        truncateText: false,
        enlarge: true,
        width: "100%",
      },
    },
    {
      field: "lastName",
      name: "Last Name",
      truncateText: true,
      mobileOptions: {
        show: false,
      },
    },
    {
      field: "github",
      name: "Github",
      render: (username: User["github"]) => (
        <EuiLink href="#" target="_blank">
          {username}
        </EuiLink>
      ),
    },
    {
      field: "dateOfBirth",
      name: "Date of Birth",
      dataType: "date",
      render: (dateOfBirth: User["dateOfBirth"]) => formatDate(dateOfBirth, "dobLong"),
    },
    {
      field: "location",
      name: "Location",
      truncateText: true,
      textOnly: true,
      render: (location: User["location"]) => {
        return `${location.city}, ${location.country}`;
      },
    },
    {
      field: "online",
      name: "Online",
      dataType: "boolean",
      render: (online: User["online"]) => {
        const color = online ? "success" : "danger";
        const label = online ? "Online" : "Offline";
        return <EuiHealth color={color}>{label}</EuiHealth>;
      },
    },
  ];

  const getRowProps = (user: User) => {
    const { id } = user;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => {},
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

export default SendsTable;
