import {
  EuiBadge,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiListGroup,
  EuiListGroupItem,
  EuiPagination,
  EuiSkeletonRectangle,
  EuiSpacer,
  EuiTableFieldDataColumnType,
  EuiText,
  EuiTimeline,
} from "@elastic/eui";
import moment from "moment";
import { useRouter } from "next/router";
import { useState } from "react";
import useGetCustomerTickets, {
  CustomerTickets,
  CustomerTicketsResponse,
} from "@/hooks/useGetCustomerTickets";
import { logIcon } from "../../utils/log_icon";
import { Template } from "@/hooks/useGetTemplates";

const LIMIT = 10;

/**
 * The logs of the customer
 * @returns the logs of the customer
 */
const Tickets: React.FC = () => {
  const router = useRouter();
  const [activePage, setActivePage] = useState(1);
  const { data, isLoading } = useGetCustomerTickets<CustomerTicketsResponse>(router.query.id, {
    pageIndex: `${activePage}`,
    pageSize: `${LIMIT}`,
  });

  const handleTicketClick = (ticketId: number) => {
    router.push(`/dashboards/crm/ticket/${ticketId}`);
  };

  const columns: Array<EuiBasicTableColumn<any>> = [
    {
      field: "id",
      name: "Тикет ID",
      render: (id) => <>{"#" + id}</>,
    },
    {
      field: "tags",
      name: "Төрөл",
      render: (tags) =>
        tags.length > 0 ? (
          <EuiFlexGroup direction="column" gutterSize="none">
            {tags.map((tag) => (
              <EuiFlexItem key={tag.id}>
                <EuiBadge color="hollow" style={{ marginRight: "4px", marginBottom: "4px" }}>
                  {tag.name}
                </EuiBadge>
              </EuiFlexItem>
            ))}
          </EuiFlexGroup>
        ) : null,
    },
    {
      field: "status",
      name: "Төлөв",
      render: (status) => (
        <EuiBadge color={status == "open" ? "success" : "danger"} iconType="dot">
          {status == "open" ? "Нээлттэй" : status == "processing" ? "Шалгагдаж байгаа" : "Хаалттай"}
        </EuiBadge>
      ),
    },
    {
      field: "assigned_to",
      name: "Хариуцах нэгж болон ажилтан",
    },
    {
      field: "priority",
      name: "Чухлын зэрэг",
      render: (prio) =>
        prio ? (
          <EuiBadge color={prio.id == 1 ? "danger" : prio.id == 4 ? "warning" : "primary"}>
            {prio.name}
          </EuiBadge>
        ) : null,
    },
    {
      field: "created_at",
      name: "Үүсгэсэн огноо",
      render: (date) => <>{moment(date).format("YYYY-MM-DD HH:MM")}</>,
    },
    {
      field: "created_by",
      name: "Үүсгэсэн ажилтан",
      render: (val) => <>{val?.email}</>,
    },
  ];

  const getRowProps = (template: CustomerTickets) => {
    const { id } = template;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => router.push(`/dashboards/crm/ticket/${id}`),
    };
  };

  const getCellProps = (
    template: CustomerTickets,
    column: EuiTableFieldDataColumnType<CustomerTickets>,
  ) => {
    const { id } = template;
    const { field } = column;

    return {
      className: "customCellClass",
      "data-test-subj": `cell-${id}-${String(field)}`,
      textOnly: true,
    };
  };

  if (data?.results?.length === 0)
    return (
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiEmptyPrompt
            iconType="list"
            title={<h2>Тикет олдсонгүй</h2>}
            body={<p>Хэрэглэгч тикет бүртгээгүй байна</p>}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );

  return (
    <EuiSkeletonRectangle isLoading={isLoading} width="100%" height={655} borderRadius="m">
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          {/* <EuiListGroup flush={true} bordered={false} maxWidth>
            {data?.results?.map((ticket) => (
              <EuiListGroupItem
                key={ticket.id}
                onClick={() => handleTicketClick(ticket.id)}
                label={"#" + ticket.id + ": " + ticket.title}
              />
            ))}
          </EuiListGroup> */}
          <EuiBasicTable
            tableCaption="Campaign table"
            items={data?.results || []}
            columns={columns}
            rowProps={getRowProps}
            cellProps={getCellProps}
          />
        </EuiFlexItem>
        {data?.total_count > LIMIT && (
          <EuiFlexItem>
            <EuiFlexGroup responsive={false} justifyContent="spaceAround">
              <EuiFlexItem grow={false}>
                <EuiPagination
                  aria-label="Customer logs"
                  pageCount={Math.ceil(data?.total_count / LIMIT) || 0}
                  activePage={activePage}
                  onPageClick={(activePage) => setActivePage(activePage)}
                  compressed
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </EuiSkeletonRectangle>
  );
};

export default Tickets;
