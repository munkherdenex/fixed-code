import {
  EuiBasicTableColumn,
  EuiTableFieldDataColumnType,
  EuiBasicTable,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiButton,
} from "@elastic/eui";
import * as yup from "yup";
import router from "next/router";
import { Controller, useForm } from "react-hook-form";
import useGetChannels, { Channels, ChannelsResponse } from "../../hooks/useGetChannels";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";

const pathPrefix = process.env.PATH_PREFIX;

const schema = yup.object({
  search: yup.string().notRequired(),
});

const ChannelsTable = () => {
  const [searchValue, setSearchValue] = useState("");
  const { data, isLoading, mutate } = useGetChannels<ChannelsResponse>(undefined, searchValue);

  const {
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

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

  const onSearch = (value: string) => {
    setSearchValue(value);
  };

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
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="flexEnd">
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
                    onSearch={onSearch}
                    placeholder="Search channel"
                    isInvalid={!!errors.search?.message}
                  />
                )}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton isLoading={isLoading} onClick={() => mutate()}>
              Refresh
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <EuiBasicTable
            tableCaption="Channels table"
            items={data?.results || []}
            columns={columns}
            rowProps={getRowProps}
            cellProps={getCellProps}
          />
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default ChannelsTable;
