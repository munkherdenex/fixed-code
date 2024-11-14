import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiIcon,
  EuiSpacer,
  EuiStat,
  EuiTextColor,
  EuiTitle,
} from "@elastic/eui";
import moment from "moment";
import { SetStateAction, useState } from "react";
import { useCampaignContext } from "../../store/campaign_store";
import { extendWeekDays } from "../../utils/helper";
import ReccurenceRule from "./reccurence_rule";

const RecurFerq = ({ freq }: { freq: string }) => {
  switch (freq) {
    case "DAILY":
      return <>day(s)</>;
    case "WEEKLY":
      return <>week(s)</>;
    case "MONTHLY":
      return <>month(s)</>;
    case "YEARLY":
      return <>year(s)</>;
    default:
      return <></>;
  }
};

const Flyout = ({
  setIsFlyoutVisible,
}: {
  setIsFlyoutVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <EuiFlyout ownFocus onClose={() => setIsFlyoutVisible(false)}>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2>Configure schedule</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <ReccurenceRule setIsFlyoutVisible={setIsFlyoutVisible} />
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

const ReccurenceRuleLayout = () => {
  const { data } = useCampaignContext();
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  const isDraft = data?.status === "DRAFT";

  return (
    <>
      <EuiStat
        title={
          <EuiFlexGroup direction="column" gutterSize="s">
            {data?.start_date || data?.end_date || data?.recur_count ? (
              <EuiFlexItem>
                <EuiFlexGroup gutterSize="none" alignItems="center" justifyContent="flexStart">
                  <EuiFlexItem>
                    <EuiFlexGroup gutterSize="xs" direction="column">
                      {data?.start_date && (
                        <EuiFlexItem>
                          Start date: {moment(data?.start_date).format("YYYY-MM-DD LT")}
                        </EuiFlexItem>
                      )}
                      {data?.end_date && data?.is_recurring && (
                        <EuiFlexItem>
                          End date: {moment(data?.end_date).format("YYYY-MM-DD LT")}
                        </EuiFlexItem>
                      )}
                      {data?.recur_count ? (
                        <EuiFlexItem>Recur count: {data?.recur_count}</EuiFlexItem>
                      ) : (
                        <></>
                      )}
                    </EuiFlexGroup>
                  </EuiFlexItem>
                  {data?.is_recurring ? (
                    <EuiFlexItem>
                      <EuiFlexGroup gutterSize="xs" direction="column">
                        {data?.recur_rule?.FREQ && (
                          <EuiFlexItem>
                            Recurrence: {data?.recur_rule?.FREQ} every {data?.recur_rule?.INTERVAL}{" "}
                            <RecurFerq freq={data?.recur_rule?.FREQ} />
                          </EuiFlexItem>
                        )}
                        {data?.recur_rule?.FREQ === "WEEKLY" && (
                          <EuiFlexItem>
                            Repeat on:{" "}
                            {extendWeekDays(data?.recur_rule?.BYDAY).map((day) => {
                              return <>{day} </>;
                            })}
                          </EuiFlexItem>
                        )}
                        {data?.recur_rule?.FREQ === "MONTHLY" && data?.recur_rule?.BYMONTHDAY && (
                          <EuiFlexItem>
                            Repeat on:{" "}
                            {data?.recur_rule?.BYMONTHDAY.map((day) => {
                              return <>{day} </>;
                            })}
                            day of the month
                          </EuiFlexItem>
                        )}
                      </EuiFlexGroup>
                    </EuiFlexItem>
                  ) : (
                    <EuiFlexItem>No recurrence scheduled</EuiFlexItem>
                  )}
                </EuiFlexGroup>
              </EuiFlexItem>
            ) : (
              <EuiFlexItem>No recurrence scheduled</EuiFlexItem>
            )}
          </EuiFlexGroup>
        }
        description={
          <EuiTextColor color="subdued">
            <span>
              <EuiIcon type="tokenDate" /> {data?.is_recurring ? "Recurring" : "One-time"} schedule
            </span>
          </EuiTextColor>
        }
        titleColor=""
        titleSize="xs"
      />
      <EuiSpacer size="s" />
      {data?.start_date && (
        <EuiFlexItem>
          <EuiButton
            color="primary"
            iconType="timeRefresh"
            onClick={() => setIsFlyoutVisible(true)}
          >
            {isDraft ? "Update Recurrence Rule" : "View Recurrence Rule"}
          </EuiButton>
        </EuiFlexItem>
      )}
      {!data?.start_date && isDraft && (
        <EuiFlexItem>
          <EuiButton color="primary" iconType="plus" onClick={() => setIsFlyoutVisible(true)}>
            Add Recurrence Rule
          </EuiButton>
        </EuiFlexItem>
      )}
      {isFlyoutVisible && <Flyout setIsFlyoutVisible={setIsFlyoutVisible} />}
    </>
  );
};

export default ReccurenceRuleLayout;
