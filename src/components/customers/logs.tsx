import {
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPagination,
  EuiText,
  EuiTimeline,
} from "@elastic/eui";
import moment from "moment";
import { useRouter } from "next/router";
import { useState } from "react";
import useGetCustomerLogs, { CustomerLogsResponse } from "../../hooks/useGetCustomerLogs";
import { logIcon } from "../../utils/log_icon";

const LIMIT = 5;

/**
 * The logs of the customer
 * @returns the logs of the customer
 */
const Logs: React.FC = () => {
  const router = useRouter();
  const [activePage, setActivePage] = useState(0);
  const { data, isLoading } = useGetCustomerLogs<CustomerLogsResponse>(router.query.id, {
    offset: `${activePage * LIMIT}`,
    limit: `${LIMIT}`,
  });

  const preparedData = data?.results.map((log) => ({
    icon: logIcon(log.type),
    iconAriaLabel: log.title,
    children: (
      <EuiText size="s">
        <p>
          {log.title} ({moment(log.created_at).format("YYYY-MM-DD LT")})
        </p>
      </EuiText>
    ),
  }));

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (data?.results?.length === 0)
    return (
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiEmptyPrompt
            iconType="list"
            title={<h2>No log found</h2>}
            body={<p>No log recorded in this campaign</p>}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiTimeline items={preparedData} />
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
  );
};

export default Logs;
