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
  EuiButtonGroup,
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
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import analyticsApi from "@/api/analytics";
import { dateFormat } from '@/utils/chart_utils';

const Customer = () => {
  const translate = useTranslations();
  const { colorMode } = useEuiTheme();
  const isDarkTheme = colorMode === "DARK";
  const chartBaseTheme = isDarkTheme ? DARK_THEME : LIGHT_THEME;
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(moment().subtract(1, "weeks"));
  const [customerInterval, setCustomerInterval] = useState("1d");
  const [customerData, setCustomerData] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    let startDate1 = moment().startOf("day").subtract(1, "days");
    switch (customerInterval) {
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
    setStartDate(startDate1)
    analyticsApi
      .getForCustomer({
        start: dateFormat(startDate1, true),
        interval: customerInterval,
      })
      .then((res) => {
        setCustomerData(res.data);
      })
      .finally(() => setIsLoading(false));
  }, [customerInterval]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const customColors = {
    colors: {
      vizColors: euiPaletteForStatus(4),
    },
  };

  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiText grow={false}>
            <h2>{translate("customers")}</h2>
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
                idSelected={customerInterval}
                onChange={(id) => setCustomerInterval(id)}
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
              xAccessor="_time"
              yAccessors={["_value"]}
              data={customerData}
              displayValueSettings={{ showValueLabel: true }}
            />
          </Chart>
        </EuiSkeletonRectangle>
      </EuiPanel>
    </>
  );
};

export default Customer;
