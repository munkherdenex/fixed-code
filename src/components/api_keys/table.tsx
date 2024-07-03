import {
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiLink,
} from "@elastic/eui";
import useGetAPIKeys, { ApiKeysType } from "../../hooks/useGetAPIKeys";

const ApiKeysTable = () => {
  const { data } = useGetAPIKeys();
  const columns: Array<EuiBasicTableColumn<ApiKeysType>> = [
    {
      field: "id",
      name: "Id",
    },
    {
      field: "name",
      name: "Name",
    },
    {
      field: "created_at",
      name: "Created Date",
    },
    {
      field: "kid",
      name: "Key Id",
      render: (kid: ApiKeysType['kid']) => {
        return <EuiLink href="#" target="_blank">{kid}  </EuiLink>;
      },
    },
  ];

  return (
    <EuiBasicTable
      items={data}
      columns={columns}
    />
  );
};

export default ApiKeysTable;
