import {
  EuiBasicTableColumn,
  EuiTableFieldDataColumnType,
  EuiBasicTable,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldSearch,
  EuiButtonIcon,
  Criteria,
  EuiEmptyPrompt,
  EuiButton,
  EuiImage,
} from "@elastic/eui";
import { useRouter } from "next/router";
import { useLayoutEffect, useState } from "react";
import useGetSegments, { Segment, SegmentResponse } from "../../hooks/useGetSegments";
import { PAGINATION_CHOOSES } from "../../constants";
import moment from "moment";
import { isNumber } from "../../utils/helper";

const pathPrefix = process.env.PATH_PREFIX;

const SegmentsTable = () => {
  const router = useRouter();
  const { query } = router;

  const querySearch = query?.search?.toString() || "";
  const queryPageIndex = isNumber(query?.pageIndex) ? +query?.pageIndex : 0;
  const queryPageSize = isNumber(query?.pageSize) ? +query?.pageSize : PAGINATION_CHOOSES[2];

  const [searchValue, setSearchValue] = useState(querySearch);
  const [pageIndex, setPageIndex] = useState(queryPageIndex);
  const [pageSize, setPageSize] = useState(queryPageSize);

  const pagination = {
    pageIndex,
    pageSize,
    pageSizeOptions: PAGINATION_CHOOSES,
  };
  const { data, isLoading, mutate } = useGetSegments<SegmentResponse>(undefined, {
    query: searchValue,
    offset: `${pageIndex * pageSize}`,
    limit: `${pageSize}`,
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
      align: "right",
      "data-test-subj": "createdAtCell",
      render: (date: string) => {
        return moment(date).format("YYYY-MM-DD LT");
      },
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
    router.push({ query: { search: value } });
  };

  const onTableChange = ({ page }: Criteria<Segment>) => {
    if (page) {
      const { index: newPageIndex, size: newPageSize } = page;
      router.push({
        query: { pageIndex: newPageIndex, pageSize: newPageSize, search: searchValue },
      });
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const getRowProps = (segment: Segment) => {
    const { id } = segment;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/cdp/segments/info/${id}`);
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

  // Condensed useEffect logic to update states when query parameters change
  useLayoutEffect(() => {
    if (querySearch !== searchValue) {
      setSearchValue(querySearch);
    }
    if (queryPageIndex !== pageIndex) {
      setPageIndex(queryPageIndex);
    }
    if (queryPageSize !== pageSize) {
      setPageSize(queryPageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryPageIndex, queryPageSize, querySearch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (data?.results?.length === 0 && !searchValue && pageIndex === 0) {
    return (
      <EuiEmptyPrompt
        icon={<EuiImage size="s" src="/images/home/empty.png" alt="" />}
        title={<h2>Create your segment</h2>}
        layout="horizontal"
        color="plain"
        body={
          <>
            <p>The segment description</p>
          </>
        }
        actions={
          <EuiButton
            color="primary"
            fill
            onClick={() => {
              router.push(`${pathPrefix}/dashboards/cdp/segments/create`);
            }}
          >
            Create segment
          </EuiButton>
        }
      />
    );
  }

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiFlexGroup responsive={false} justifyContent="spaceBetween" alignItems="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiFieldSearch
              defaultValue={searchValue}
              onSearch={onSearch}
              placeholder="Search Segments"
            />
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
            pagination={
              data?.total_count > pageSize
                ? {
                    ...pagination,
                    totalItemCount: data?.total_count || 0,
                    showPerPageOptions: true,
                  }
                : {
                    totalItemCount: 0,
                    pageIndex: 0,
                    pageSize: 0,
                  }
            }
            onChange={onTableChange}
          />
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default SegmentsTable;
