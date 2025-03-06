import {
  Chart,
  Settings,
  Partition,
  PartitionLayout,
  DARK_THEME,
  LIGHT_THEME,
} from "@elastic/charts";
import { EuiPanel, EuiText, EuiSpacer, useEuiTheme, EuiSkeletonRectangle } from "@elastic/eui";
import useGetCampaignAnalytics from "../../hooks/useGetCampaignAnalytics";
import { useTranslations } from "next-intl";

const CampaignStatus = () => {
  const { colorMode } = useEuiTheme();
  const translate = useTranslations();

  const isDarkTheme = colorMode === "DARK";
  const chartBaseTheme = isDarkTheme ? DARK_THEME : LIGHT_THEME;

  const { data, isLoading } = useGetCampaignAnalytics();

  const preperadData = data
    ? Object.keys(data).map((key) => ({
        name: key == "finished" ? "Дуссан" : "Нээлттэй",
        data: data[key],
      }))
    : [];

  return (
    <div>
      <EuiPanel>
        <EuiText>
          <h3>{translate("status_analytics")}</h3>
        </EuiText>
        <EuiSpacer size="s" />
        <EuiSkeletonRectangle isLoading={isLoading} width="100%" height={250}>
          <Chart size={{ height: 250 }}>
            <Settings baseTheme={chartBaseTheme} />
            <Partition
              id="donutByLanguage"
              data={preperadData}
              layout={PartitionLayout.sunburst}
              valueAccessor={(d) => Number(d.data)}
              layers={[
                {
                  groupByRollup: (d) => d.name,
                  shape: {
                    fillColor: (_, sortIndex) => chartBaseTheme.colors.vizColors![sortIndex],
                  },
                },
              ]}
              clockwiseSectors={false}
            />
          </Chart>
        </EuiSkeletonRectangle>
      </EuiPanel>
    </div>
  );
};

export default CampaignStatus;
