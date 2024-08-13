import { Chart, Settings, Metric, DARK_THEME, LIGHT_THEME } from "@elastic/charts";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPanel,
  EuiSuperDatePicker,
  OnRefreshProps,
  OnTimeChangeProps,
  useEuiTheme,
} from "@elastic/eui";
import { useState } from "react";
import { commonStyles } from "../styles/global.styles";

const MetricChart = () => {
  const { colorMode } = useEuiTheme();
  const cStyles = commonStyles();
  const chartBaseTheme = colorMode === "DARK" ? DARK_THEME : LIGHT_THEME;

  const [isLoading, setIsLoading] = useState(false);
  const [start, setStart] = useState("now-30m");
  const [end, setEnd] = useState("now");
  const [customColorsValue] = useState(5 - 3.364726);

  const onTimeChange = ({ start, end }: OnTimeChangeProps) => {
    setStart(start);
    setEnd(end);
    setIsLoading(true);
    startLoading();
  };

  const onRefresh = async ({ start, end, refreshInterval }: OnRefreshProps) => {
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
    console.log(start, end, refreshInterval);
  };

  const startLoading = () => {
    setTimeout(stopLoading, 1000);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 3,
  });

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiSuperDatePicker
          isLoading={isLoading}
          start={start}
          end={end}
          onTimeChange={onTimeChange}
          onRefresh={onRefresh}
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFlexGroup>
          <EuiFlexItem grow={0}>
            <EuiPanel paddingSize="none" css={cStyles.overflowHidden}>
              <Chart size={[200, 200]}>
                <Settings baseTheme={chartBaseTheme} />
                <Metric
                  id="1"
                  data={[
                    [
                      {
                        color: colorMode === "DARK" ? "#1D1E24" : "white",
                        title: "Audience",
                        icon: () => <EuiIcon type="sortDown" />,
                        extra: (
                          <span>
                            Total audience <strong>{formatter.format(1250000)}</strong>
                          </span>
                        ),
                        value: (customColorsValue === 5 ? NaN : 5 - customColorsValue) * 10000,
                        valueFormatter: (v) => formatter.format(v),
                      },
                    ],
                  ]}
                />
              </Chart>
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem grow={0}>
            <EuiPanel paddingSize="none" css={cStyles.overflowHidden}>
              <Chart size={[200, 200]}>
                <Settings baseTheme={chartBaseTheme} />
                <Metric
                  id="1"
                  data={[
                    [
                      {
                        color: colorMode === "DARK" ? "#1D1E24" : "white",
                        title: "Notifications",
                        icon: () => <EuiIcon type="sortUp" />,
                        extra: (
                          <span>
                            Total notifications <strong>{formatter.format(232323)}</strong>
                          </span>
                        ),
                        value: (customColorsValue === 5 ? NaN : 5 - customColorsValue) * 4000,
                        valueFormatter: (v) => formatter.format(v),
                      },
                    ],
                  ]}
                />
              </Chart>
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default MetricChart;
