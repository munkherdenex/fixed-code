import { Chart, Settings, DARK_THEME, LIGHT_THEME, LayoutDirection, Metric } from "@elastic/charts";
import {
  EuiButton,
  EuiButtonGroup,
  EuiButtonIcon,
  EuiCard,
  EuiFlexGrid,
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
import { useState, useEffect } from "react";
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
      label: "1 хоног",
    },
    {
      id: `${compressedToggleButtonGroupPrefix}__1`,
      label: "7 хоног",
    },
    {
      id: `${compressedToggleButtonGroupPrefix}__2`,
      label: "1 сар",
    },
    {
      id: `${compressedToggleButtonGroupPrefix}__3`,
      label: "1 жил",
    },
  ];

  const periodMap = {
    [`${compressedToggleButtonGroupPrefix}__0`]: "1d",
    [`${compressedToggleButtonGroupPrefix}__1`]: "7d",
    [`${compressedToggleButtonGroupPrefix}__2`]: "1m",
    [`${compressedToggleButtonGroupPrefix}__3`]: "1y",
  };

  const selectedPeriod = periodMap[toggleCompressedIdSelected] || "1y";

  const { analyticsData, isAnalyticsLoading, analyticsError, refreshAnalytics } =
    useGetAnalytics(selectedPeriod);

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

  const renderCards = () => {
    if (isAnalyticsLoading) {
      return emptyArr.map((item, index) => (
        <EuiFlexItem key={`loading-${index}`}>
          <EuiCard
            textAlign="left"
            title={item.title}
            titleSize="xs"
            display="subdued"
            footer={
              <EuiFlexGroup justifyContent="flexEnd">
                <EuiFlexItem grow={false}>
                  <EuiSkeletonRectangle width={60} height={30} />
                </EuiFlexItem>
              </EuiFlexGroup>
            }
          ></EuiCard>
        </EuiFlexItem>
      ));
    }

    if (analyticsData?.data && analyticsData.data.length > 0) {
      return analyticsData.data.map((item, index) => (
        <EuiFlexItem key={`data-${index}-${item._value}`}>
          <EuiCard
            textAlign="left"
            title={item._measurement}
            titleSize="xs"
            display="subdued"
            footer={
              <EuiFlexGroup justifyContent="flexEnd">
                <EuiFlexItem grow={false}>
                  <div style={card}>{item._value}</div>
                </EuiFlexItem>
              </EuiFlexGroup>
            }
          ></EuiCard>
        </EuiFlexItem>
      ));
    }

    return emptyArr.map((item, index) => (
      <EuiFlexItem key={`empty-${index}`}>
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
    ));
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
        <EuiFlexGrid columns={4}>{renderCards()}</EuiFlexGrid>
      </EuiPanel>
    </EuiSplitPanel.Outer>
  );
};

export default Total;
