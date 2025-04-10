import { Chart, Settings, DARK_THEME, LIGHT_THEME, LayoutDirection, Metric } from "@elastic/charts";
import {
  EuiButton,
  EuiButtonGroup,
  EuiButtonIcon,
  EuiCard,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSkeletonRectangle,
  EuiSpacer,
  EuiSplitPanel,
  EuiText,
  EuiTextColor,
  useEuiTheme,
  useGeneratedHtmlId,
  useIsWithinMaxBreakpoint,
} from "@elastic/eui";
import { useAudienceContext } from "../../store/audience_store";
import { useTranslations } from "next-intl";
import { useState } from "react";
import useGetAnalytics from "@/hooks/useGetAnalytics";

const Total = () => {
  const compressedToggleButtonGroupPrefix = useGeneratedHtmlId({
    prefix: "compressedToggleButtonGroup",
  });
  const audientT = useTranslations();
  const { colorMode } = useEuiTheme();
  const largeMaxBreakpoint = useIsWithinMaxBreakpoint("l");
  const isDarkTheme = colorMode === "DARK";
  const chartBaseTheme = isDarkTheme ? DARK_THEME : LIGHT_THEME;
  const card = {
    fontWeight: "700",
    fontSize: "27px",
  };

  const [toggleCompressedIdSelected, setToggleCompressedIdSelected] = useState(
    `${compressedToggleButtonGroupPrefix}__1`,
  );

  const toggleButtonsCompressed = [
    {
      id: `${compressedToggleButtonGroupPrefix}__0`,
      label: "7 хоног",
    },
    {
      id: `${compressedToggleButtonGroupPrefix}__1`,
      label: "1 сар",
    },
    {
      id: `${compressedToggleButtonGroupPrefix}__2`,
      label: "3 сар",
    },
    {
      id: `${compressedToggleButtonGroupPrefix}__3`,
      label: "1 жил",
    },
  ];

  const periodMap = {
    [`${compressedToggleButtonGroupPrefix}__0`]: "7d", // 7 days
    [`${compressedToggleButtonGroupPrefix}__1`]: "1m", // 1 month
    [`${compressedToggleButtonGroupPrefix}__2`]: "3m", // 3 months
    [`${compressedToggleButtonGroupPrefix}__3`]: "1y", // 1 year
  };

  const selectedPeriod = periodMap[toggleCompressedIdSelected] || "1y";

  const { analyticsData, isAnalyticsLoading, analyticsError, refreshAnalytics } =
    useGetAnalytics(selectedPeriod);

  // const { data, isLoading } = useAudienceContext();

  const emptyArr = [
    {
      title: "Нийт илгээсэн тоо",
      value: 0,
    },
    {
      title: "Нээсэн тоо",
      value: 0,
    },
    {
      title: "Нээсэн үзүүлэлт",
      value: 0,
    },
    {
      title: "Дарагдсан үзүүлэлт",
      value: 0,
    },
    {
      title: "Нийт дарсан тоо",
      value: 0,
    },
  ];

  const onChangeCompressed = (optionId) => {
    setToggleCompressedIdSelected(optionId);
  };

  return (
    <EuiSplitPanel.Outer>
      <EuiSplitPanel.Inner color="subdued" paddingSize="m">
        <strong>{audientT("report")}</strong>
      </EuiSplitPanel.Inner>
      <EuiPanel>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiButtonGroup
              legend="This is a basic group"
              options={toggleButtonsCompressed}
              idSelected={toggleCompressedIdSelected}
              onChange={(id) => onChangeCompressed(id)}
              buttonSize="m"
              color="text"
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              display="base"
              size="m"
              aria-label="Autosave"
              title="Autosave"
              iconType="refresh"
              color="primary"
              isLoading={isAnalyticsLoading}
              onClick={() => refreshAnalytics()}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="m" />
        <EuiText grow={false}>
          <EuiTextColor color="subdued">
            <h4>Хэрэглэгчийн мэдээлэл</h4>
            <EuiSpacer size="xs" />
          </EuiTextColor>
        </EuiText>
        <EuiFlexGroup>
          {analyticsData?.data.length > 0
            ? analyticsData.data.map((item) => (
                <EuiFlexItem key={item.value}>
                  <EuiCard
                    textAlign="left"
                    title={item.title}
                    titleSize="xs"
                    display="subdued"
                    footer={
                      <EuiFlexGroup justifyContent="flexEnd">
                        <EuiFlexItem grow={false}>
                          <div style={card}>{item.value}</div>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    }
                  ></EuiCard>
                </EuiFlexItem>
              ))
            : emptyArr.map((item) => (
                <EuiFlexItem key={item.value}>
                  <EuiCard
                    textAlign="left"
                    title={item.title}
                    titleSize="xs"
                    display="subdued"
                    footer={
                      <EuiFlexGroup justifyContent="flexEnd">
                        <EuiFlexItem grow={false}>
                          <div style={card}>{item.value}</div>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    }
                  ></EuiCard>
                </EuiFlexItem>
              ))}
        </EuiFlexGroup>
        {/* <EuiPanel paddingSize="none" hasBorder style={{ overflow: "hidden" }}>
        <Chart size={{ height: largeMaxBreakpoint ? 100 : 150 }}>
          <Settings
            baseTheme={chartBaseTheme}
            rotation={0}
            showLegend={largeMaxBreakpoint ? false : true}
            legendPosition={"top"}
          />
          <Metric id="1" data={[totalData2]} />
        </Chart>
      </EuiPanel> */}
      </EuiPanel>
    </EuiSplitPanel.Outer>
  );
};

export default Total;
