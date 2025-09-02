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
import { dateFormat, generateChartIntervals, groupBy } from "@/utils/chart_utils";

type CampaignProps = {
  interval: "1d" | "7d" | "1m";
  pickerRange: { start: moment.Moment; end: moment.Moment };
};

const Campaign = ({ interval, pickerRange }: CampaignProps) => {
  const translate = useTranslations();
  const { colorMode } = useEuiTheme();
  const isDarkTheme = colorMode === "DARK";
  const chartBaseTheme = isDarkTheme ? DARK_THEME : LIGHT_THEME;

  const [isLoading, setIsLoading] = useState(true);
  const [templatesData, setTemplatesData] = useState<any>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    analyticsApi
      .getForTemplate({
        start: dateFormat(pickerRange.start, true),
        end: dateFormat(pickerRange.end, true),
        interval: interval,
        group_by_kind: true,
        measurement: ["sends"].join(","),
      })
      .then((res) => {
        setTemplatesData(res.data);
      })
      .finally(() => setIsLoading(false));
  }, [interval, pickerRange]);

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
      const t = templatesData?.data.map((item: any) => {
        return {
          ...item,
          _time: dateFormat(item._time, window !== "1h"),
          kind: item.kind.toUpperCase(),
        };
      });
      return groupBy(t, "kind");
    }
    return [];
  }, [templatesData]);

  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiText grow={false}>
            <h2>Илгээсэн мэдэгдлүүд /төрлөөр/</h2>
          </EuiText>
        </EuiFlexItem>

        <EuiFlexItem grow={false}>

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

            {chartData &&
              Object.keys(chartData).map((key) => (
                <BarSeries
                  key={`kind-chart-${key}`}
                  id={key}
                  xScaleType={ScaleType.Time}
                  xAccessor="_time"
                  yAccessors={["_value"]}
                  splitSeriesAccessors={["kind"]}
                  data={chartData[key]}
                  displayValueSettings={{ showValueLabel: true }}
                />

              ))}
          </Chart>
        </EuiSkeletonRectangle>
      </EuiPanel>
    </>
  );
};

export default Campaign;
