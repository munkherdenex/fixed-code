import {
  Chart,
  Settings,
  DARK_THEME,
  LIGHT_THEME,
  Axis,
  ScaleType,
  Position,
  LineSeries,
} from "@elastic/charts";
import {
  EuiButton,
  EuiDatePicker,
  EuiDatePickerRange,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSkeletonRectangle,
  EuiText,
  useEuiTheme,
} from "@elastic/eui";
import moment from "moment";
import { useMemo, useState, useCallback, useEffect } from "react";
import useGetCustomerAnalytics from "../../hooks/useGetCustomerAnalytics";
import { useCampaignContext } from "../../store/campaign_store";
import { useTranslations } from "next-intl";

const Graph = () => {
  const { data: campaignData } = useCampaignContext();
  const translate = useTranslations();
  const { colorMode } = useEuiTheme();

  const isDarkTheme = colorMode === "DARK";
  const chartBaseTheme = isDarkTheme ? DARK_THEME : LIGHT_THEME;

  const minDate = useMemo(() => moment("2024-12-1"), []);
  const maxDate = useMemo(() => moment(), []);

  const { data, isMutating, trigger } = useGetCustomerAnalytics();

  const [startDate, setStartDate] = useState(moment().subtract(1, "weeks"));
  const [endDate, setEndDate] = useState(maxDate);

  const isInvalid = startDate >= endDate || startDate < minDate || endDate > maxDate;

  const refresh = useCallback(async () => {
    if (isInvalid) return;
    try {
      const start = moment.duration(startDate.diff(endDate));
      const end = moment.duration(endDate.diff(moment()));
      await trigger({
        start: `${Math.ceil(start.asDays())}d`,
        stop: `${Math.ceil(end.asDays())}d`,
        window: "1d",
        log_types: [
          "api_called",
          "api_interacted",
          "email_sent",
          "email_opened",
          "email_link_clicked",
          "email_unsubscribed",
          "push_notif_clicked",
          "sms_link_clicked",
        ],
        template_id: campaignData?.id,
      });
    } catch (error) {
      console.error(error);
    }
  }, [endDate, isInvalid, startDate, trigger, campaignData]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sortedData =
    (data &&
      Array.isArray(data) &&
      data?.sort((a, b) => (moment(a._start).isAfter(b._start) ? 1 : 0))) ||
    [];

  return (
    <div>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiText grow={false}>
            <h2>{translate("campaign")}</h2>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiDatePickerRange
                isInvalid={isInvalid}
                startDateControl={
                  <EuiDatePicker
                    selected={startDate}
                    onChange={(date) => date && setStartDate(date)}
                    startDate={startDate}
                    endDate={endDate}
                    minDate={minDate}
                    maxDate={endDate}
                    aria-label="Start date"
                    showTimeSelect
                  />
                }
                endDateControl={
                  <EuiDatePicker
                    selected={endDate}
                    onChange={(date) => date && setEndDate(date)}
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    maxDate={maxDate}
                    aria-label="End date"
                    showTimeSelect
                  />
                }
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton fill iconType="refresh" onClick={() => refresh()}>
                {translate("refresh")}
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSkeletonRectangle isLoading={isMutating} width="100%" height={400}>
        <Chart size={["100%", 400]}>
          <Settings baseTheme={chartBaseTheme} showLegend legendPosition={Position.Top} />
          <Axis id="count" title="Count" position={Position.Left} />
          <Axis
            id="time"
            title="Time"
            position={Position.Bottom}
            tickFormat={(tickValue) => moment(tickValue).format("l")}
          />
          <LineSeries
            id="bars"
            xScaleType={ScaleType.Time}
            stackAccessors={["true"]}
            splitSeriesAccessors={["log_type"]}
            xAccessor="_start"
            yAccessors={["_value"]}
            data={sortedData}
            displayValueSettings={{ showValueLabel: true }}
          />
        </Chart>
      </EuiSkeletonRectangle>
    </div>
  );
};

export default Graph;
