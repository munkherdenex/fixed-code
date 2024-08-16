import { Chart, DARK_THEME, LayoutDirection, LIGHT_THEME, Metric, Settings } from "@elastic/charts";
import { EuiFlexGroup, EuiFlexItem, EuiPanel, useEuiTheme } from "@elastic/eui";
import { useState } from "react";
import useGetMetrics, { MetricResponse, MetricType } from "../hooks/useGetMetrics";
import { commonStyles } from "../styles/global.styles";

const options = [
  { value: "1d", text: "1 day" },
  { value: "7d", text: "7 day" },
  { value: "30d", text: "30 day" },
  { value: "90d", text: "90 day" },
];

const MetricChart = () => {
  const { colorMode } = useEuiTheme();
  const cStyles = commonStyles();
  const { data, isLoading } = useGetMetrics<MetricResponse>();

  const [metricDay] = useState(options[1].value);

  const chartBaseTheme = colorMode === "DARK" ? DARK_THEME : LIGHT_THEME;

  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 3,
  });

  const currentData = data?.[metricDay] as MetricType;

  if (isLoading) return <div>Loading...</div>;

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiFlexGroup>
          <EuiFlexItem grow={1}>
            <EuiFlexGroup responsive={false}>
              <EuiFlexItem grow={1}>
                <EuiPanel paddingSize="none" css={cStyles.overflowHidden}>
                  <Chart size={{ height: 150 }}>
                    <Settings baseTheme={chartBaseTheme} />
                    <Metric
                      id="1"
                      data={[
                        [
                          {
                            color: colorMode === "DARK" ? "#1D1E24" : "white",
                            title: "Audience (API)",
                            extra: <div>Last 24 hour change</div>,
                            value: currentData?.customers_created_api,
                            valueFormatter: (v) => formatter.format(v),
                          },
                        ],
                      ]}
                    />
                  </Chart>
                </EuiPanel>
              </EuiFlexItem>
              <EuiFlexItem grow={1}>
                <EuiPanel paddingSize="none" css={cStyles.overflowHidden}>
                  <Chart size={{ height: 150 }}>
                    <Settings baseTheme={chartBaseTheme} />
                    <Metric
                      id="1"
                      data={[
                        [
                          {
                            color: colorMode === "DARK" ? "#1D1E24" : "white",
                            title: "Audience (WEB)",
                            value: currentData?.customers_created_web,
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
          <EuiFlexItem grow={2}>
            <EuiPanel paddingSize="none" css={cStyles.overflowHidden}>
              <Chart size={{ height: 150 }}>
                <Settings baseTheme={chartBaseTheme} />
                <Metric
                  id="1"
                  data={[
                    [
                      {
                        color: "#3c3c3c",
                        title: "Campaigns (api)",
                        // domainMax: customColorsValue,
                        progressBarDirection: LayoutDirection.Vertical,
                        value: currentData?.notifications_sent_api,
                        valueFormatter: (v) => formatter.format(v),
                      },
                      {
                        color: "#FFBDAF",
                        title: "Campaigns (email)",
                        // domainMax: customColorsValue,
                        progressBarDirection: LayoutDirection.Vertical,
                        value: currentData?.notifications_sent_email,
                        valueFormatter: (v) => formatter.format(v),
                      },
                      {
                        color: "#6DCCB1",
                        title: "Campaigns (push)",
                        // domainMax: customColorsValue,
                        progressBarDirection: LayoutDirection.Vertical,
                        value: currentData?.notifications_sent_push,
                        valueFormatter: (v) => formatter.format(v),
                      },
                      {
                        color: "#a1cbea",
                        title: "Campaigns (In app)",
                        // domainMax: customColorsValue,
                        progressBarDirection: LayoutDirection.Vertical,
                        value: currentData?.notifications_sent_inapp,
                        valueFormatter: (v) => formatter.format(v),
                      },
                      {
                        color: "#FFD700",
                        title: "Campaigns (sms)",
                        // domainMax: customColorsValue,
                        progressBarDirection: LayoutDirection.Vertical,
                        value: currentData?.notifications_sent_sms,
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
