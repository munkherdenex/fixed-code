import {
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPagination,
  EuiText,
  EuiTimeline,
} from "@elastic/eui";
import { useRouter } from "next/router";
import { useState } from "react";
import useGetCustomerLogs, { CustomerLogsResponse } from "../../hooks/useGetCustomerLogs";

const LIMIT = 10;

const Logs: React.FC = () => {
  const router = useRouter();
  const [activePage, setActivePage] = useState(0);
  const { data, isLoading } = useGetCustomerLogs<CustomerLogsResponse>(router.query.id, {
    offset: `${activePage * LIMIT}`,
    limit: `${LIMIT}`,
  });

  const preparedData = data?.results.map((log) => ({
    icon: "email",
    iconAriaLabel: log.title,
    children: (
      <EuiText size="s">
        <h4>
          <strong>{log.title}</strong>
        </h4>
        <p>{log.type}</p>
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
