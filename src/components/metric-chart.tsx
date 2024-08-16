import { Chart, DARK_THEME, LayoutDirection, LIGHT_THEME, Metric, Settings } from "@elastic/charts";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSelect,
  useEuiTheme,
  useGeneratedHtmlId,
} from "@elastic/eui";
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
  const basicSelectId = useGeneratedHtmlId({ prefix: "basicSelect" });
  const { colorMode } = useEuiTheme();
  const cStyles = commonStyles();
  const { data } = useGetMetrics<MetricResponse>();

  const [metricDay, setMetricDay] = useState(options[1].value);

  const chartBaseTheme = colorMode === "DARK" ? DARK_THEME : LIGHT_THEME;

  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 3,
  });

  const onChange = (e) => {
    setMetricDay(e.target.value);
  };

  const currentData = data[metricDay] as MetricType;

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiSelect
          id={basicSelectId}
          options={options}
          value={metricDay}
          onChange={(e) => onChange(e)}
          aria-label="Use aria labels when no actual label is in use"
        />
      </EuiFlexItem>
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
