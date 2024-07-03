import { EuiBasicTableColumn, EuiTableFieldDataColumnType, EuiBasicTable } from "@elastic/eui";
import router from "next/router";
import useGetChannels, { Channels, ChannelsResponse } from "../../hooks/useGetChannels";

const pathPrefix = process.env.PATH_PREFIX;

const ChannelsTable = () => {
  const { data, isLoading } = useGetChannels<ChannelsResponse>();

  const columns: Array<EuiBasicTableColumn<Channels>> = [
    {
      field: "id",
      name: "ID",
      "data-test-subj": "idCell",
      mobileOptions: {
        enlarge: true,
      },
    },
    {
      field: "name",
      name: "Name",
      "data-test-subj": "nameCell",
      mobileOptions: {
        enlarge: true,
      },
    },
    {
      field: "channel_type",
      name: "Channel type",
      "data-test-subj": "descriptionCell",
      mobileOptions: {
        enlarge: true,
      },
    },
    {
      field: "created_at",
      name: "Created at",
      "data-test-subj": "createdAtCell",
      mobileOptions: {
        enlarge: true,
      },
    },
  ];

  const getRowProps = (channel: Channels) => {
    const { id } = channel;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/channels/info/${id}`);
      },
    };
  };

  const getCellProps = (channel: Channels, column: EuiTableFieldDataColumnType<Channels>) => {
    const { id } = channel;
    const { field } = column;

    return {
      className: "customCellClass",
      "data-test-subj": `cell-${id}-${String(field)}`,
      textOnly: true,
    };
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <EuiBasicTable
      items={data?.results || []}
      columns={columns}
      rowProps={getRowProps}
      cellProps={getCellProps}
    />
  );
};

export default ChannelsTable;
