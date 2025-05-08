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
  EuiTextColor,
} from "@elastic/eui";
import { useRouter } from "next/router";
import { useLayoutEffect, useMemo, useState } from "react";
import useGetSegments, { Segment, SegmentResponse } from "../../hooks/useGetSegments";
import { PAGINATION_CHOOSES } from "../../constants";
import moment from "moment";
import { isNumber } from "../../utils/helper";
import { useTranslations } from "next-intl";

const pathPrefix = process.env.PATH_PREFIX;

const SegmentsTable = () => {
  const router = useRouter();
  const { query } = router;
  const translate = useTranslations();

  const querySearch = query?.search?.toString() || "";
  const queryPageIndex = isNumber(query?.pageIndex) ? +query?.pageIndex : 1;
  const queryPageSize = isNumber(query?.pageSize) ? +query?.pageSize : PAGINATION_CHOOSES[0];

  const [searchValue, setSearchValue] = useState(querySearch);
  const [pageIndex, setPageIndex] = useState(queryPageIndex);
  const [pageSize, setPageSize] = useState(queryPageSize);

  const apiParams = useMemo(() => ({
    query: searchValue,
    offset: `${pageIndex}`,
    limit: `${pageSize}`,
  }), [searchValue, pageIndex, pageSize]);

  const pagination = useMemo(
    () => ({
      pageIndex: pageIndex - 1,
      pageSize,
      pageSizeOptions: PAGINATION_CHOOSES,
    }),
    [pageIndex, pageSize],
  );

  const { data, isLoading, mutate } = useGetSegments<SegmentResponse>(undefined, apiParams);

  const columns: Array<EuiBasicTableColumn<Segment>> = [
    {
      field: "name",
      name: translate("name"),
      "data-test-subj": "nameCell",
      mobileOptions: {
        render: (segment: Segment) => <>{segment.name}</>,
      },
    },
    {
      field: "description",
      name: translate("description"),
      "data-test-subj": "descriptionCell",
      mobileOptions: {
        render: (segment: Segment) => (
          <>
            {segment?.description ? (
              segment?.description
            ) : (
              <EuiTextColor color="subdued">None</EuiTextColor>
            )}
          </>
        ),
      },
    },
    {
      field: "type",
      name: translate("type"),
      "data-test-subj": "typeCell",
      mobileOptions: {
        render: (segment: Segment) => <>{segment.type}</>,
      },
    },
    {
      field: "created_at",
      name: translate("created-at"),
      "data-test-subj": "createdAtCell",
      render: (date: string) => {
        return moment(date).format("YYYY-MM-DD LT");
      },
    },
    {
      field: "updated_at",
      name: translate("updated-at"),
      align: "right",
      "data-test-subj": "updatedAtCell",
      render: (date: string) => {
        return moment(date).format("YYYY-MM-DD LT");
      },
      footer: () => {
        return (
          <strong>
            {translate("total-segments")}: {data?.total_count || 0}
          </strong>
        );
      },
    },
  ];

  const onSearch = (value: string) => {
    setSearchValue(value);
    router.push({ query: { search: value } });
  };

  const onTableChange = ({ page }: Criteria<Segment>) => {
    if (page) {
      const { index, size } = page;
      const newPageIndex = index + 1;
      router.push({
        query: { pageIndex: newPageIndex, pageSize: size, search: searchValue },
      });
      setPageIndex(newPageIndex);
      setPageSize(size);
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
  }, [query]);

  if (isLoading) {
    return <div>{translate("loading")}</div>;
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
            <p>{translate("the-segment-description")}</p>
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
            {translate("create-segment")}
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
              placeholder={translate("search-segments")}
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
          <div>{translate("loading")}</div>
        ) : (
          <EuiBasicTable
            tableCaption="Segments table"
            items={data?.results || []}
            columns={columns}
            rowProps={getRowProps}
            cellProps={getCellProps}
            pagination={
              data?.total_count > pageSize
                ? { ...pagination, totalItemCount: data?.total_count || 0, showPerPageOptions: true }
                : null
            }
            onChange={onTableChange}
          />
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default SegmentsTable;
