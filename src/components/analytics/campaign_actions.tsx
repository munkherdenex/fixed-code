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
import {
  dateFormat,
  generateChartIntervals,
  getMeasurementName,
} from "@/utils/chart_utils";

type Props = {
  interval: "1d" | "7d" | "1m";
  pickerRange: { start: moment.Moment; end: moment.Moment };
};

const CampaignActions = ({ interval, pickerRange }: Props) => {
  const translate = useTranslations();
  const { colorMode } = useEuiTheme();
  const isDarkTheme = colorMode === "DARK";
  const chartBaseTheme = isDarkTheme ? DARK_THEME : LIGHT_THEME;

  const [isLoading, setIsLoading] = useState(true);
  const [templatesData, setTemplatesData] = useState<any>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    let params: any = { interval, kind: "email" };

    if (pickerRange.start && pickerRange.end) {
      params.start = dateFormat(pickerRange.start, true);
      params.end = dateFormat(pickerRange.end, true);
    }

    params.measurement = [
      "sends",
      "email_opened",
      "email_link_clicked",
      "email_unsubscribed",
    ].join(",");

    analyticsApi
      .getForTemplate(params)
      .then((res) => setTemplatesData(res.data))
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
      return templatesData.data.map((item: any) => {
        const time = moment(item._start);
        return {
          ...item,
          _time: dateFormat(item._time, window !== "1h"),
          _measurement: getMeasurementName(item._measurement),
        };
      });
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
              id="campaign-actions"
              xScaleType={ScaleType.Time}
              xAccessor="_time"
              yAccessors={["_value"]}
              splitSeriesAccessors={["_measurement"]}
              data={chartData}
            />

          </Chart>

        </EuiSkeletonRectangle>
      </EuiPanel>
    </>
  );
};

export default CampaignActions;
