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

const Customer = ({ interval, pickerRange }: Props) => {
  const translate = useTranslations();
  const { colorMode } = useEuiTheme();
  const isDarkTheme = colorMode === "DARK";
  const chartBaseTheme = isDarkTheme ? DARK_THEME : LIGHT_THEME;

  const [isLoading, setIsLoading] = useState(true);
  const [customerData, setCustomerData] = useState<any>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    let params: any = { interval };

    if (pickerRange.start && pickerRange.end) {
      params.start = dateFormat(pickerRange.start, true);
      params.end = dateFormat(pickerRange.end, true);
    }

    analyticsApi
      .getForCustomer(params)
      .then((res) => setCustomerData(res.data))
      .finally(() => setIsLoading(false));
  }, [interval, pickerRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const chartRangeX = useMemo(() => {
    if (customerData) {
      const start = moment(customerData?.current_range["start"]);
      const end = moment(customerData?.current_range["end"]);
      const window = customerData?.current_range["window"];
      return generateChartIntervals(start, end, window);
    }
    return [];
  }, [customerData]);

const chartData = useMemo(() => {
  if (customerData && Array.isArray(customerData?.data)) {
    return customerData.data.map((item: any) => ({
      ...item,
      _time: new Date(item._time).getTime(), 
      _measurement: getMeasurementName(item._measurement),
    }));
  }
  return [];
}, [customerData]);

  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiText grow={false}>
            <h2>Харилцагчид</h2>
          </EuiText>
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size="s" />

      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiPanel hasBorder>
            <EuiSkeletonRectangle isLoading={isLoading} width="100%" height={500}>
              <Chart size={["100%", 500]}>
                <Settings
                  baseTheme={chartBaseTheme}
                  showLegend
                  legendPosition={Position.Top}
                  xDomain={chartRangeX}
                />
                <Axis id="count" title="Count" position={Position.Left} />
                <Axis id="time" title="Time" position={Position.Bottom} />
                <BarSeries
                  id="bars"
                  xScaleType={ScaleType.Time}
                  stackAccessors={["true"]}
                  splitSeriesAccessors={["_measurement"]}
                  xAccessor="_time"
                  yAccessors={["_value"]}
                  data={chartData}
                  displayValueSettings={{ showValueLabel: true }}
                />
              </Chart>
            </EuiSkeletonRectangle>
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};

export default Customer;
