import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiIcon,
  EuiStat,
  EuiTextColor,
  EuiTitle,
} from "@elastic/eui";
import moment from "moment";
import { SetStateAction, useState } from "react";
import { useCampaignContext } from "../../store/campaign_store";
import { extendWeekDays } from "../../utils/helper";
import ReccurenceRule from "./reccurence_rule";
import { useTranslations } from "next-intl";

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
  const translate = useTranslations();

  return (
    <EuiFlyout ownFocus onClose={() => setIsFlyoutVisible(false)}>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2>{translate("configure_schedule")}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <ReccurenceRule setIsFlyoutVisible={setIsFlyoutVisible} />
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

const RecurrenceDetails = ({ recurRule }) => {
  const translate = useTranslations();

  if (!recurRule?.FREQ) return null;

  return (
    <EuiFlexGroup gutterSize="xs" direction="column">
      <EuiFlexItem>
        {translate("recur_every", {
          FREQ: recurRule.FREQ,
          INTERVAL: recurRule.INTERVAL,
        })}
        : <RecurFerq freq={recurRule.FREQ} />
      </EuiFlexItem>
      {recurRule.FREQ === "WEEKLY" && (
        <EuiFlexItem>
          {translate("recur_repeat_on", {
            BYDAY: extendWeekDays(recurRule.BYDAY).join(", "),
          })}
        </EuiFlexItem>
      )}
      {recurRule.FREQ === "MONTHLY" && recurRule.BYMONTHDAY && (
        <EuiFlexItem>
          {translate("recur_repeat_on_month", {
            BYMONTHDAY: recurRule.BYMONTHDAY.join(", "),
          })}
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
};

const RecurrenceRuleButtons = ({ startDate, isDraft, setIsFlyoutVisible }) => {
  const translate = useTranslations();

  return (
    <div>
      {startDate ? (
        <EuiButton color="primary" iconType="timeRefresh" onClick={() => setIsFlyoutVisible(true)}>
          {translate("action_reccurence_rule", {
            action: isDraft ? "Update" : "View",
          })}
        </EuiButton>
      ) : (
        isDraft && (
          <EuiButton color="primary" iconType="plus" onClick={() => setIsFlyoutVisible(true)}>
            {translate("action_reccurence_rule", {
              action: "Add",
            })}
          </EuiButton>
        )
      )}
    </div>
  );
};

const ReccurenceRuleLayout = () => {
  const translate = useTranslations();
  const { data } = useCampaignContext();
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  const isDraft = data?.status === "DRAFT";

  return (
    <>
      <EuiStat
        title={
          <EuiFlexGroup gutterSize="s" alignItems="center">
            {data?.start_date || data?.end_date || data?.recur_count ? (
              <>
                <EuiFlexItem>
                  <EuiFlexGroup gutterSize="xs" direction="column">
                    {data.start_date && (
                      <EuiFlexItem>
                        {translate("start_date")}: {moment(data.start_date).format("YYYY-MM-DD LT")}
                      </EuiFlexItem>
                    )}
                    {data.end_date && data.is_recurring && (
                      <EuiFlexItem>
                        {translate("end_date")}: {moment(data.end_date).format("YYYY-MM-DD LT")}
                      </EuiFlexItem>
                    )}
                    {data.recur_count > 0 && (
                      <EuiFlexItem>
                        {translate("recur_count")}: {data.recur_count}
                      </EuiFlexItem>
                    )}
                  </EuiFlexGroup>
                </EuiFlexItem>
                <EuiFlexItem>
                  {data.is_recurring ? (
                    <RecurrenceDetails recurRule={data.recur_rule} />
                  ) : (
                    <EuiFlexItem>{translate("no_recurrence_scheduled")}</EuiFlexItem>
                  )}
                </EuiFlexItem>
              </>
            ) : (
              <EuiFlexItem>{translate("no_recurrence_scheduled")}</EuiFlexItem>
            )}
            <EuiFlexItem grow={false}>
              <RecurrenceRuleButtons
                startDate={data?.start_date}
                isDraft={isDraft}
                setIsFlyoutVisible={setIsFlyoutVisible}
              />
            </EuiFlexItem>
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
      {isFlyoutVisible && <Flyout setIsFlyoutVisible={setIsFlyoutVisible} />}
    </>
  );
};

export default ReccurenceRuleLayout;
