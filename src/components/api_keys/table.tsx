import {
  EuiBasicTable,
  EuiBasicTableColumn,
} from "@elastic/eui";
import useGetAPIKeys, { ApiKeysType } from "../../hooks/useGetAPIKeys";
import moment from "moment";

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
      field: "team_name",
      name: "Team name",
      width: '20%',
    },
    {
      field: "created_at",
      name: "Created Date",
      width: '20%',
      render: (apiKey: ApiKeysType) => moment(apiKey.created_at).format("YYYY-MM-DD hh:mm:ss"),
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
