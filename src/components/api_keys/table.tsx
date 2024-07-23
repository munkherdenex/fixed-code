import { EuiBasicTable, EuiBasicTableColumn } from "@elastic/eui";
import useGetAPIKeys, { ApiKeysType } from "../../hooks/useGetAPIKeys";
import moment from "moment";

const ApiKeysTable = () => {
  const { data } = useGetAPIKeys();
  const columns: Array<EuiBasicTableColumn<ApiKeysType>> = [
    {
      field: "name",
      name: "Name",
    },
    {
      field: "team_name",
      name: "Team name",
    },
    {
      field: "created_at",
      name: "Created Date",
      render: (apiKey: ApiKeysType) => moment(apiKey.created_at).format("YYYY-MM-DD LT"),
    },
    {
      field: "kid",
      name: "Key Id",
      render: (kid: ApiKeysType["kid"]) => {
        return <p>{kid}</p>;
      },
    },
  ];

  return <EuiBasicTable items={data} columns={columns} />;
};

export default ApiKeysTable;
