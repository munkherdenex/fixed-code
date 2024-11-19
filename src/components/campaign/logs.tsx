import {
  EuiButton,
  EuiButtonEmpty,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiPagination,
  EuiText,
  EuiTimeline,
} from "@elastic/eui";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import useGetLogs, { LogsResponse } from "../../hooks/useGetLogs";
import { useCampaignContext } from "../../store/campaign_store";
import moment from "moment";
import { getDataKind } from "../../utils/helper";

const LIMIT = 10;

const Logs: React.FC = () => {
  const router = useRouter();
  const { data: campaignData } = useCampaignContext();
  const [activePage, setActivePage] = useState(0);
  const { data, isLoading } = useGetLogs<LogsResponse>({
    template_id: router.query.id as string,
    offset: `${activePage * LIMIT}`,
    limit: `${LIMIT}`,
  });

  const preparedData = useMemo(() => {
    if (getDataKind(campaignData) === "email") {
      return data?.results.map((log) => ({
        icon: +log?.response_status === 1 ? "check" : "cross",
        iconAriaLabel: log.body,
        children: (
          <EuiText size="s" color={+log?.response_status === 1 ? "default" : "red"}>
            <p>
              {log.customer_id} ( {moment(log.created_at).format("YYYY-MM-DD LT")} )
            </p>
          </EuiText>
        ),
      }));
    } else {
      return data?.results.map((log) => ({
        icon: +log?.response_status < 300 && +log?.response_status >= 200 ? "check" : "cross",
        iconAriaLabel: log.body,
        children: (
          <>
            <EuiText
              size="s"
              color={
                +log?.response_status < 300 && +log?.response_status >= 200 ? "default" : "red"
              }
            >
              <EuiLink onClick={() => router.push(`/dashboards/audience/info/${log.customer_id}`)}>
                {log.customer}
              </EuiLink>{" "}
              <span>( {moment(log.created_at).format("YYYY-MM-DD LT")} )</span>
            </EuiText>
            <EuiText size="xs" color="subdued">
              <p>{log.response}</p>
            </EuiText>
          </>
        ),
      }));
    }
  }, [campaignData, data?.results, router]);

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
                aria-label="Campaign logs"
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
