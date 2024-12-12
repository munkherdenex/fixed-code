import {
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiPagination,
  EuiSkeletonRectangle,
  EuiText,
  EuiTextTruncate,
  EuiTimeline,
} from "@elastic/eui";
import moment from "moment";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import useGetLogs, { LogsResponse } from "../../hooks/useGetLogs";
import { useCampaignContext } from "../../store/campaign_store";
import { getDataKind } from "../../utils/helper";
import { useTranslations } from "next-intl";

const LIMIT = 10;

const EmailBody = ({ log }) => {
  const router = useRouter();
  return (
    <EuiText size="s" color={+log?.response_status === 1 ? "default" : "red"}>
      <p>
        <EuiLink onClick={() => router.push(`/dashboards/cdp/audience/info/${log.customer_id}`)}>
          {log.customer}
        </EuiLink>{" "}
        ( {moment(log.created_at).format("YYYY-MM-DD LT")} )
      </p>
    </EuiText>
  );
};

const OtherBody = ({ log }) => {
  const router = useRouter();
  return (
    <>
      <EuiText
        size="s"
        color={+log?.response_status < 300 && +log?.response_status >= 200 ? "default" : "red"}
      >
        <EuiLink onClick={() => router.push(`/dashboards/cdp/audience/info/${log.customer_id}`)}>
          {log.customer}
        </EuiLink>{" "}
        <span>( {moment(log.created_at).format("YYYY-MM-DD LT")} )</span>
      </EuiText>
      <EuiText size="xs" color="subdued">
        <EuiTextTruncate text={log?.response} truncation="end" />
      </EuiText>
    </>
  );
};

const Logs: React.FC = () => {
  const router = useRouter();
  const translate = useTranslations();

  const [activePage, setActivePage] = useState(0);

  const { data: campaignData } = useCampaignContext();
  const { data, isLoading } = useGetLogs<LogsResponse>({
    template_id: router.query.id as string,
    offset: `${activePage * LIMIT}`,
    limit: `${LIMIT}`,
  });

  const preparedData = useMemo(() => {
    if (getDataKind(campaignData) === "email") {
      return data?.results?.map((log) => ({
        icon: +log?.response_status === 1 ? "check" : "cross",
        iconAriaLabel: log.body,
        children: <EmailBody log={log} />,
      }));
    }
    return data?.results?.map((log) => ({
      icon: +log?.response_status < 300 && +log?.response_status >= 200 ? "check" : "cross",
      iconAriaLabel: log.body,
      children: <OtherBody log={log} />,
    }));
  }, [campaignData, data?.results]);

  if (data?.results?.length === 0)
    return (
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiEmptyPrompt
            iconType="list"
            title={<h2>{translate("no_log_found_title")}</h2>}
            body={<p>{translate("no_log_found_body")}</p>}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );

  return (
    <EuiSkeletonRectangle isLoading={isLoading} width="100%" height={390}>
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
    </EuiSkeletonRectangle>
  );
};

export default Logs;
