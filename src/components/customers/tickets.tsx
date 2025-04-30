import {
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiListGroup,
  EuiListGroupItem,
  EuiPagination,
  EuiSkeletonRectangle,
  EuiText,
  EuiTimeline,
} from "@elastic/eui";
import moment from "moment";
import { useRouter } from "next/router";
import { useState } from "react";
import useGetCustomerTickets, { CustomerTicketsResponse } from "@/hooks/useGetCustomerTickets";
import { logIcon } from "../../utils/log_icon";

const LIMIT = 10;

/**
 * The logs of the customer
 * @returns the logs of the customer
 */
const Tickets: React.FC = () => {
  const router = useRouter();
  const [activePage, setActivePage] = useState(1);
  const { data, isLoading } = useGetCustomerTickets<CustomerTicketsResponse>(router.query.id, {
    offset: `${activePage}`,
    limit: `${LIMIT}`,
  });

  const handleTicketClick = (ticketId: number) => {
    router.push(`/dashboards/crm/ticket/${ticketId}`);
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
          <EuiListGroup flush={true} bordered={false} maxWidth>
            {data?.results?.map((ticket) => (
              <EuiListGroupItem
                key={ticket.id}
                onClick={() => handleTicketClick(ticket.id)}
                label={"#" + ticket.id + ": " + ticket.title}
              />
            ))}
          </EuiListGroup>
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
