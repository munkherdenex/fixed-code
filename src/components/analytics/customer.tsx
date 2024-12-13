import {
  Axis,
  Chart,
  DARK_THEME,
  LIGHT_THEME,
  LineSeries,
  Position,
  ScaleType,
  Settings,
} from "@elastic/charts";
import {
  EuiButton,
  EuiDatePicker,
  EuiDatePickerRange,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSkeletonRectangle,
  EuiSpacer,
  EuiText,
  euiPaletteForStatus,
  useEuiTheme,
} from "@elastic/eui";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState } from "react";
import useGetCustomerAnalytics from "../../hooks/useGetCustomerAnalytics";
import { useTranslations } from "next-intl";

const Customer = () => {
  const translate = useTranslations();
  const { colorMode } = useEuiTheme();
  const isDarkTheme = colorMode === "DARK";
  const chartBaseTheme = isDarkTheme ? DARK_THEME : LIGHT_THEME;

  const customColors = {
    colors: {
      vizColors: euiPaletteForStatus(4),
    },
  };

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
        log_types: ["create", "update"],
      });
    } catch (error) {
      console.error(error);
    }
  }, [endDate, isInvalid, startDate, trigger]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sortedData =
    (data &&
      Array.isArray(data) &&
      data?.sort((a, b) => (moment(a._start).isAfter(b._start) ? 1 : 0))) ||
    [];

  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiText grow={false}>
            <h2>{translate("customers")}</h2>
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
      <EuiSpacer size="s" />
      <EuiPanel hasBorder>
        <EuiSkeletonRectangle isLoading={isMutating} width="100%" height={500}>
          <Chart size={["100%", 500]}>
            <Settings
              baseTheme={chartBaseTheme}
              theme={customColors}
              showLegend
              legendPosition={Position.Top}
            />
            <Axis id="count" title="Count" position={Position.Left} />
            <Axis
              id="time"
              title="Time"
              position={Position.Bottom}
              tickFormat={(tickValue) => moment(tickValue).format("YYYY-MM-DD LT")}
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
      </EuiPanel>
    </>
  );
};

export default Customer;
