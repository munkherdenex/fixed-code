import {
  Axis,
  BarSeries,
  Chart,
  DARK_THEME,
  LIGHT_THEME,
  Position,
  ScaleType,
  Settings,
} from "@elastic/charts";
import {
  EuiButtonGroup,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSkeletonRectangle,
  EuiSpacer,
  EuiText,
  useEuiTheme,
} from "@elastic/eui";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import analyticsApi from "@/api/analytics";
import { dateFormat, generateChartIntervals } from "@/utils/chart_utils";

const Campaign = () => {
  const translate = useTranslations();
  const { colorMode } = useEuiTheme();
  const isDarkTheme = colorMode === "DARK";
  const chartBaseTheme = isDarkTheme ? DARK_THEME : LIGHT_THEME;

  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(moment().subtract(1, "weeks"));
  const [dataInterval, setDataInterval] = useState("1d");

  const [templatesData, setTemplatesData] = useState(null);
  const loadData = useCallback(async () => {
    setIsLoading(true);
    analyticsApi
      .getForTemplate({
        start: dateFormat(startDate, true),
        group_by_kind: true,
      })
      .then((res) => {
        setTemplatesData(res.data);
      })
      .finally(() => setIsLoading(false));
  }, [startDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const chartRangeX = useMemo(() => {
    if (templatesData) {
      const start = moment(templatesData?.current_range["start"]);
      const end = moment(templatesData?.current_range["end"]);
      const window = templatesData?.current_range["window"];

      return generateChartIntervals(start, end, window);
    }
    return [];
  }, [templatesData]);

  const chartData = useMemo(() => {
    if (templatesData && Array.isArray(templatesData?.data)) {
      const window = templatesData?.current_range["window"];
      return templatesData?.data.map((item) => {
        return { ...item, _time: dateFormat(item._time, window != "1h") };
      });
    }
    return [];
  }, [templatesData]);

  useEffect(() => {
    switch (dataInterval) {
      case "1d":
        setStartDate(moment().startOf("day").subtract(1, "days"));
        break;
      case "7d":
        setStartDate(moment().startOf("day").subtract(7, "days"));
        break;
      case "1m":
        setStartDate(moment().startOf("day").subtract(1, "months"));
        break;
      default:
        break;
    }
  }, [dataInterval]);

  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiText grow={false}>
            <h2>{translate("campaign")}</h2>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup alignItems="baseline">
            <EuiFlexItem>
              <EuiText>{startDate.format("YYYY-MM-DD")}-аас</EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiButtonGroup
                legend="Truncation type"
                idSelected={dataInterval}
                onChange={(id) => setDataInterval(id)}
                options={[
                  { id: "1d", label: "1 өдөр" },
                  { id: "7d", label: "7 хоног" },
                  { id: "1m", label: "1 сар" },
                ]}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="s" />
      <EuiPanel hasBorder>
        <EuiSkeletonRectangle isLoading={isLoading} width="100%" height={500}>
          <Chart size={["100%", 500]}>
            <Settings
              baseTheme={chartBaseTheme}
              showLegend
              legendPosition={Position.Right}
              xDomain={chartRangeX}
            />
            <Axis id="count" title="Count" position={Position.Left} />
            <Axis
              id="time"
              title="Time"
              position={Position.Bottom}
              tickFormat={(tickValue) => moment(tickValue).format("l")}
            />
            <BarSeries
              id="bars"
              xScaleType={ScaleType.Time}
              stackAccessors={["true"]}
              splitSeriesAccessors={["kind"]}
              xAccessor="_time"
              yAccessors={["_value"]}
              data={chartData}
              displayValueSettings={{ showValueLabel: true }}
            />
          </Chart>
        </EuiSkeletonRectangle>
      </EuiPanel>
    </>
  );
};

export default Campaign;
