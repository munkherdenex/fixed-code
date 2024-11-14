import { Criteria, EuiBasicTable, EuiBasicTableColumn } from "@elastic/eui";
import useGetAPIKeys, { ApiKeysType } from "../../hooks/useGetAPIKeys";
import moment from "moment";
import { PAGINATION_CHOOSES } from "../../constants";
import { useRouter } from "next/router";
import { isNumber } from "../../utils/helper";
import { useLayoutEffect, useMemo, useState } from "react";

const ApiKeysTable = () => {
  const router = useRouter();
  const { query } = router;
  const queryPageIndex = isNumber(query?.pageIndex) ? +query?.pageIndex : 0;
  const queryPageSize = isNumber(query?.pageSize) ? +query?.pageSize : PAGINATION_CHOOSES[2];

  const [pageIndex, setPageIndex] = useState(queryPageIndex);
  const [pageSize, setPageSize] = useState(queryPageSize);

  const { data } = useGetAPIKeys({
    limit: `${pageSize}`,
    offset: `${pageIndex * pageSize}`,
  });

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
      name: "Created at",
      render: (date: string) => {
        return moment(date).format("YYYY-MM-DD LT");
      },
    },
    {
      field: "kid",
      name: "Key Id",
      render: (kid: ApiKeysType["kid"]) => {
        return <p>{kid}</p>;
      },
    },
  ];

  // Memoizing pagination config
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
      pageSizeOptions: PAGINATION_CHOOSES,
    }),
    [pageIndex, pageSize],
  );

  const onTableChange = ({ page }: Criteria<ApiKeysType>) => {
    if (page) {
      const { index: newPageIndex, size: newPageSize } = page;
      router.push({
        query: { pageIndex: newPageIndex, pageSize: newPageSize },
      });
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  // Condensed useEffect logic to update states when query parameters change
  useLayoutEffect(() => {
    if (queryPageIndex !== pageIndex) {
      setPageIndex(queryPageIndex);
    }
    if (queryPageSize !== pageSize) {
      setPageSize(queryPageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryPageIndex, queryPageSize]);

  return (
    <EuiBasicTable
      tableLayout="auto"
      items={Array.isArray(data) ? data : []}
      columns={columns}
      // pagination={
      //   data?.total_count > pageSize
      //     ? { ...pagination, totalItemCount: data?.total_count || 0 }
      //     : null
      // }
      onChange={onTableChange}
    />
  );
};

export default ApiKeysTable;
