import { Chart, Settings, DARK_THEME, LIGHT_THEME, LayoutDirection, Metric } from "@elastic/charts";
import {
  EuiPanel,
  EuiSkeletonRectangle,
  useEuiTheme,
  useIsWithinMaxBreakpoint,
} from "@elastic/eui";
import { useAudienceContext } from "../../store/audience_store";

const Total = () => {
  const { colorMode } = useEuiTheme();
  const largeMaxBreakpoint = useIsWithinMaxBreakpoint("l");
  const isDarkTheme = colorMode === "DARK";
  const chartBaseTheme = isDarkTheme ? DARK_THEME : LIGHT_THEME;

  const { data, isLoading } = useAudienceContext();

  const totalData2 = [
    {
      color: "#F1D86F",
      title: "Total sent",
      value: +data?.total_sent,
      domainMax: +data?.total_sent,
      valueFormatter: (v: number) => `${v}`,
      progressBarDirection: LayoutDirection.Vertical,
    },
    {
      color: "#6ECCB1",
      title: "Total unique opens",
      value: +data?.total_unique_opens,
      domainMax: +data?.total_sent,
      valueFormatter: (v: number) => `${v}`,
      progressBarDirection: LayoutDirection.Vertical,
    },
    {
      color: "#FF7E62",
      title: "Total clicks",
      value: +data?.total_clicks,
      domainMax: +data?.total_sent,
      valueFormatter: (v: number) => `${v}`,
      progressBarDirection: LayoutDirection.Vertical,
    },
    {
      color: "#6A5F31",
      title: "Open rate",
      value: +data?.open_rate,
      domainMax: 100,
      valueFormatter: (v: number) => `${v}%`,
      progressBarDirection: LayoutDirection.Vertical,
    },
    {
      color: "#1B5583",
      title: "Click rate",
      value: +data?.click_rate,
      domainMax: 100,
      valueFormatter: (v: number) => `${v}%`,
      progressBarDirection: LayoutDirection.Vertical,
    },
  ];

  return (
    <EuiSkeletonRectangle
      isLoading={isLoading}
      width="100%"
      height={largeMaxBreakpoint ? 100 : 150}
      borderRadius="m"
    >
      <EuiPanel paddingSize="none" hasBorder style={{ overflow: "hidden" }}>
        <Chart size={{ height: largeMaxBreakpoint ? 100 : 150 }}>
          <Settings
            baseTheme={chartBaseTheme}
            rotation={0}
            showLegend={largeMaxBreakpoint ? false : true}
            legendPosition={"top"}
          />
          <Metric id="1" data={[totalData2]} />
        </Chart>
      </EuiPanel>
    </EuiSkeletonRectangle>
  );
};

export default Total;
