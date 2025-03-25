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
import {
  dateFormat,
  generateChartIntervals,
  getMeasurementName,
  groupBy,
} from "@/utils/chart_utils";
import Campaign from "./campaign";

const CampaignActions = () => {
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
    let startDate1 = null;
    switch (dataInterval) {
      case "1d":
        startDate1 = moment().startOf("day").subtract(1, "days");
        break;
      case "7d":
        startDate1 = moment().startOf("day").subtract(7, "days");
        break;
      case "1m":
        startDate1 = moment().startOf("day").subtract(1, "months");
        break;
      default:
        break;
    }
    setStartDate(startDate1);
    analyticsApi
      .getForTemplate({
        start: dateFormat(startDate1, true),
        interval: dataInterval,
        kind: "email",
        measurement: ["sends","email_opened", "email_link_clicked", "email_unsubscribed"].join(","),
      })
      .then((res) => {
        setTemplatesData(res.data);
      })
      .finally(() => setIsLoading(false));
  }, [dataInterval]);

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
      const t = templatesData?.data.map((item) => {
        return {
          ...item,
          _time: dateFormat(item._time, window != "1h"),
          _measurement: getMeasurementName(item._measurement),
        };
      });
      console.log(t)
      return t;
    }
    return [];
  }, [templatesData]);

  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiText grow={false}>
            <h2>Имэйл /нээсэн, дарсан, unsubscribe хийсэн/</h2>
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
            <Axis id="time" title="Time" position={Position.Bottom} />
            <BarSeries
              id={`BarSeries`}
              xScaleType={ScaleType.Time}
              splitSeriesAccessors={["_measurement"]}
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

export default CampaignActions;
