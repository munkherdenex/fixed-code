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
      width: '10%',
    },
    {
      field: "name",
      name: "Name",
      width: '20%',
    },
    {
      field: "created_at",
      name: "Created Date",
    },
    {
      field: "kid",
      name: "Key Id",
      render: (kid: ApiKeysType['kid']) => {
        return <p >{kid}  </p>;
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
