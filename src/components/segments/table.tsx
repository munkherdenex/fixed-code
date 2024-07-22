import {
  EuiBasicTableColumn,
  EuiTableFieldDataColumnType,
  EuiBasicTable,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldSearch,
  EuiFormRow,
  EuiButtonIcon,
  Criteria,
} from "@elastic/eui";
import * as yup from "yup";
import router from "next/router";
import { useState } from "react";
import useGetSegments, { Segment, SegmentResponse } from "../../hooks/useGetSegments";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { PAGINATION_CHOOSES } from "../../constants";

const pathPrefix = process.env.PATH_PREFIX;

const schema = yup.object({
  search: yup.string().notRequired(),
});

const SegmentsTable = () => {
  const [searchValue, setSearchValue] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const pagination = {
    pageIndex,
    pageSize,
    pageSizeOptions: PAGINATION_CHOOSES,
  };
  const { data, isLoading, mutate } = useGetSegments<SegmentResponse>(undefined, {
    search: searchValue,
    offset: `${pageIndex * pageSize}`,
    limit: `${pageSize}`,
  });

  const {
    control,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
  });

  const columns: Array<EuiBasicTableColumn<Segment>> = [
    {
      field: "name",
      name: "Name",
      "data-test-subj": "nameCell",
      mobileOptions: {
        render: (segment: Segment) => <>{segment.name}</>,
        enlarge: true,
      },
    },
    {
      field: "description",
      name: "Description",
      "data-test-subj": "descriptionCell",
      mobileOptions: {
        render: (segment: Segment) => <>{segment.description}</>,
        enlarge: true,
      },
    },
    {
      field: "type",
      name: "Type",
      "data-test-subj": "typeCell",
      mobileOptions: {
        render: (segment: Segment) => <>{segment.type}</>,
        enlarge: true,
      },
    },
    {
      field: "created_at",
      name: "Created at",
      "data-test-subj": "createdAtCell",
      footer: () => {
        return <strong>Total: {data?.total_count || 0}</strong>;
      },
      mobileOptions: {
        enlarge: true,
      },
    },
  ];

  const onSearch = (value: string) => {
    setSearchValue(value);
  };

  const onTableChange = ({ page }: Criteria<Segment>) => {
    if (page) {
      const { index: pageIndex, size: pageSize } = page;
      setPageIndex(pageIndex);
      setPageSize(pageSize);
    }
  };

  const getRowProps = (segment: Segment) => {
    const { id } = segment;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/segments/info/${id}`);
      },
    };
  };

  const getCellProps = (segment: Segment, column: EuiTableFieldDataColumnType<Segment>) => {
    const { id } = segment;
    const { field } = column;

    return {
      className: "customCellClass",
      "data-test-subj": `cell-${id}-${String(field)}`,
      textOnly: true,
    };
  };

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiFlexGroup responsive={false} justifyContent="spaceBetween" alignItems="flexEnd">
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
                    placeholder="Search segments"
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
            tableCaption="Segments table"
            items={data?.results || []}
            columns={columns}
            rowProps={getRowProps}
            cellProps={getCellProps}
            pagination={{
              ...pagination,
              totalItemCount: data?.total_count || 0,
              showPerPageOptions: true,
            }}
            onChange={onTableChange}
          />
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default SegmentsTable;
