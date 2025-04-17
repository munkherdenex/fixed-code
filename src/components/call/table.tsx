// @ts-nocheck

import {
  Criteria,
  EuiBadge,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButtonIcon,
  EuiComboBox,
  EuiDatePicker,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
} from "@elastic/eui";
import { useRouter } from "next/router";
import { useLayoutEffect, useState } from "react";
import moment, { Moment } from "moment";
import { PAGINATION_CHOOSES } from "../../constants";
import { isNumber } from "../../utils/helper";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import contactLogApi from "../../api/contact_log";
import CallDetailFlyout from "./call_detail_flyout";
import { css } from "@emotion/react";
import { CallStateBadge } from './call_state_badge';


export const callStateOptions = [
  { label: "Дуудаж байна", value: "start" },
  { label: "Харилцаж байна...", value: "answered" },
  { label: "Дууссан", value: "end" },
  { label: "Хэрэглэгч тасласан", value: "user_abandoned" },
  { label: "Дуудах цаг дууссан", value: "call_timeout" },
];

export const callTypeOptions = [
  { label: "Ирсэн дуудлага", value: "inbound" },
  { label: "Гарсан дуудлага", value: "outbound" },
];

const Table = () => {
  const router = useRouter();
  const { query } = router;
  const translate = useTranslations();

  // Consolidate query parameters into a single object
  const initialQueryState = {
    search: query?.search?.toString() || "",
    filter: query?.filter?.toString() || "",
    call_state: query?.call_state?.toString() || "",
    call_type: query?.call_type?.toString() || "",
    date: query?.date ? moment(query?.date) : null,
    offset: isNumber(query?.offset) ? +query?.offset : 0,
    limit: isNumber(query?.limit) ? +query?.limit : PAGINATION_CHOOSES[0],
  };

  const [queryState, setQueryState] = useState(initialQueryState);
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);

  const pagination = {
    pageIndex: queryState.offset,
    pageSize: queryState.limit,
    pageSizeOptions: PAGINATION_CHOOSES,
  };

  const { data, isLoading, mutate } = useSWR(["/crm/calls/", queryState], () =>
    contactLogApi.getCalls(queryState),
  );

  const columns: Array<EuiBasicTableColumn<any>> = [
    {
      field: "phone",
      name: "Утасны дугаар",
      render: (phone: string, row: any) => (
        <span>
          <EuiIcon
            title={callTypeOptions.find((option) => option.value === row.call_type)?.label || ""}
            css={css`
              transform: rotate(45deg);
              margin-right: 0.3em;
            `}
            color={row.call_type === "inbound" ? "success" : "danger"}
            type={row.call_type === "inbound" ? "sortDown" : "sortUp"}
          />
          {phone}
        </span>
      ),
    },
    {
      field: "call_date",
      name: "Залгасан огноо",
    },
    {
      field: "call_state",
      name: "Дуудлагын төлөв",
      render: (call_state: string) => {
        return (
          <CallStateBadge callState={call_state} />
        )
      }
    },
    {
      field: "call_agent",
      name: "Дуудлага авсан ажилтан",
    },
  ];

  const onSearch = (value: string) => {
    const updatedQueryState = { ...queryState, search: value, offset: 0 };
    setQueryState(updatedQueryState);
    router.push({ query: updatedQueryState });
  };

  const onTableChange = ({ page }: Criteria<any>) => {
    if (page) {
      const updatedQueryState = {
        ...queryState,
        offset: page.index,
        limit: page.size,
      };
      setQueryState(updatedQueryState);
      router.push({ query: updatedQueryState });
    }
  };

  const handleRowClick = (call: any) => {
    router.push(`/dashboards/crm/call/${call.call_id}`);
  };

  const getRowProps = (call: any) => ({
    "data-test-subj": `row-${call.id}`,
    className: "customRowClass",
    onClick: () => handleRowClick(call),
  });

  const getCellProps = (call: any, column: EuiBasicTableColumn<any>) => ({
    className: "customCellClass",
    "data-test-subj": `cell-${call.id}-${String(column.field)}`,
    textOnly: true,
  });

  const oncall_stateChange = (selectedOptions: any[]) => {
    const updatedQueryState = {
      ...queryState,
      call_state: selectedOptions.length > 0 ? selectedOptions[0].value : "",
      offset: 0,
    };
    setQueryState(updatedQueryState);
    router.push({ query: updatedQueryState });
  };

  const oncall_typeChange = (selectedOptions: any[]) => {
    const updatedQueryState = {
      ...queryState,
      call_type: selectedOptions.length > 0 ? selectedOptions[0].value : "",
      offset: 0,
    };
    setQueryState(updatedQueryState);
    router.push({ query: updatedQueryState });
  };

  const onDateChange = (date: Moment | null) => {
    const updatedQueryState = { ...queryState, date, offset: 0 };
    setQueryState(updatedQueryState);
    router.push({ query: { ...queryState, date: date?.toISOString() || "" } });
  };

  useLayoutEffect(() => {
    const updatedQueryState = {
      search: query?.search?.toString() || "",
      filter: query?.filter?.toString() || "",
      call_state: query?.call_state?.toString() || "",
      call_type: query?.call_type?.toString() || "",
      date: query?.date ? moment(query?.date) : null,
      offset: isNumber(query?.offset) ? +query?.offset : 0,
      limit: isNumber(query?.limit) ? +query?.limit : PAGINATION_CHOOSES[2],
    };
    setQueryState(updatedQueryState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  if (isLoading) {
    return <div>{translate("loading")}</div>;
  }

  return (
    <>
      {isFlyoutVisible && (
        <CallDetailFlyout
          setIsFlyoutVisible={setIsFlyoutVisible}
          selectedCall={selectedCall}
          mutate={mutate}
        />
      )}

      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiFlexGroup responsive={false} gutterSize='s'>
            <EuiFlexItem grow={false}>
              <EuiFieldSearch
                defaultValue={queryState.search}
                onSearch={onSearch}
                placeholder={translate("search")}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiComboBox
                placeholder="Дуудлагын төлөв"
                singleSelection={{ asPlainText: true }}
                options={callStateOptions}
                selectedOptions={
                  queryState.call_state
                    ? callStateOptions.filter((option) => option.value === queryState.call_state)
                    : []
                }
                onChange={oncall_stateChange}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiComboBox
                placeholder="Дуудлагын төрөл"
                singleSelection={{ asPlainText: true }}
                options={callTypeOptions}
                selectedOptions={
                  queryState.call_type
                    ? callTypeOptions.filter((option) => option.value === queryState.call_type)
                    : []
                }
                onChange={oncall_typeChange}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiDatePicker
                selected={queryState.date}
                onChange={onDateChange}
                placeholder="Огноо сонгох"
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                display="base"
                iconType="refresh"
                size="m"
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
              tableCaption="Дуудлагын жагсаалт"
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
    </>
  );
};

export default Table;
