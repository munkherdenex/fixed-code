import {
  EuiBasicTableColumn,
  EuiTableFieldDataColumnType,
  EuiBasicTable,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiButtonIcon,
  Criteria,
} from "@elastic/eui";
import * as yup from "yup";
import router from "next/router";
import { Controller, useForm } from "react-hook-form";
import useGetChannels, { Channels, ChannelsResponse } from "../../hooks/useGetChannels";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { PAGINATION_CHOOSES } from "../../constants";

const pathPrefix = process.env.PATH_PREFIX;

const schema = yup.object({
  search: yup.string().notRequired(),
});

const ChannelsTable = () => {
  const [searchValue, setSearchValue] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const pagination = {
    pageIndex,
    pageSize,
    pageSizeOptions: PAGINATION_CHOOSES,
  };

  const { data, isLoading, mutate } = useGetChannels<ChannelsResponse>(undefined, {
    search: searchValue,
    offset: `${pageIndex * pageSize}`,
    limit: `${pageSize}`,
  });

  const {
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const columns: Array<EuiBasicTableColumn<Channels>> = [
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

  const onTableChange = ({ page }: Criteria<Channels>) => {
    if (page) {
      const { index: pageIndex, size: pageSize } = page;
      setPageIndex(pageIndex);
      setPageSize(pageSize);
    }
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
            <EuiButtonIcon
              display="base"
              iconType="refresh"
              size="s"
              isLoading={isLoading}
              onClick={() => mutate()}
            />
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
            pagination={{
              ...pagination,
              totalItemCount: data?.count || 0,
              showPerPageOptions: true,
            }}
            onChange={onTableChange}
          />
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default ChannelsTable;
