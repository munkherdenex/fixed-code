import { Chart, DARK_THEME, LayoutDirection, LIGHT_THEME, Metric, Settings } from "@elastic/charts";
import { EuiFlexGroup, EuiFlexItem, EuiPanel, EuiText, useEuiTheme } from "@elastic/eui";
import { useState } from "react";
import useGetMetrics, { MetricResponse, MetricType } from "../hooks/useGetMetrics";
import { commonStyles } from "../styles/global.styles";
import Link from "next/link";
import useSWR from 'swr';
import templateApi from '@/api/template';

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
  const { data: templatesStats } = useSWR('templates_stats', async () => {
    const res = await templateApi.getStats();
    return res.data;
  })

  const [metricDay] = useState(options[1].value);

  const chartBaseTheme = colorMode === "DARK" ? DARK_THEME : LIGHT_THEME;

  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 3,
  });

  const currentData = data?.[metricDay] as MetricType;

  if (isLoading) return <div>Уншиж байна...</div>;

  return (
    <EuiFlexGroup>
      <EuiFlexItem grow={1}>
        <EuiFlexGroup responsive={false}>
          <EuiFlexItem>
            <EuiPanel paddingSize="none" css={cStyles.overflowHidden}>
              <Chart size={{ height: 150 }}>
                <Settings baseTheme={chartBaseTheme} />
                <Metric
                  id="1"
                  data={[
                    [
                      {
                        color: colorMode === "DARK" ? "#1D1E24" : "white",
                        title: "API-аар нэмэгдсэн",
                        subtitle: "Харилцагч",
                        extra: <>Сүүлийн 24 цагт</>,
                        value: currentData?.customers_created_api,
                        valueFormatter: (v) => formatter.format(v),
                      },
                      {
                        color: colorMode === "DARK" ? "#1D1E24" : "white",
                        title: "WEB-ээр нэмэгдсэн",
                        subtitle: "Харилцагч",
                        extra: <>Сүүлийн 24 цагт</>,
                        value: currentData?.customers_created_web,
                        valueFormatter: (v) => formatter.format(v),
                      },
                      {
                        color: colorMode === "DARK" ? "#1D1E24" : "white",
                        title: "Мэдээлэл шинэчлэгдсэн",
                        subtitle: "Харилцагч",
                        extra: <>Сүүлийн 24 цагт</>,
                        value: currentData?.customers_updated,
                        valueFormatter: (v) => formatter.format(v),
                      },
                    ]
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
                        color: colorMode === "DARK" ? "#1D1E24" : "6ECCB1",
                        title: "Идэвхтэй",
                        subtitle: "Мэдэгдэл",
                        extra: <Link href="/dashboards/cdp/campaign?tab=active-tab--id">Бүдгийг харах</Link>,
                        value: templatesStats?.active_count,
                        valueFormatter: (v) => formatter.format(v),
                      },
                      {
                        color: colorMode === "DARK" ? "#1D1E24" : "aliceblue",
                        title: "Бэлтгэж буй",
                        subtitle: "Мэдэгдэл",
                        extra: <Link href="/dashboards/cdp/campaign?tab=draft-tab--id">Бүдгийг харах</Link>,
                        value: templatesStats?.draft_count,
                        valueFormatter: (v) => formatter.format(v),
                      },
                      {
                        color: colorMode === "DARK" ? "#1D1E24" : "#ccc",
                        title: "Батлуулах",
                        subtitle: "Мэдэгдэл",
                        extra: <Link href="/dashboards/cdp/campaign?tab=done-tab--id">Бүдгийг харах</Link>,
                        value: templatesStats?.approve_pending_count,
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
