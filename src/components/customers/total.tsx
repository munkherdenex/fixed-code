import { Chart, Settings, DARK_THEME, LIGHT_THEME, LayoutDirection, Metric } from "@elastic/charts";
import {
  EuiButton,
  EuiButtonGroup,
  EuiButtonIcon,
  EuiCard,
  EuiDatePicker,
  EuiDatePickerRange,
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
import { useTranslations } from "next-intl";
import { useState } from "react";
import useGetAnalytics from "@/hooks/useGetAnalytics";
import moment from "moment";

interface TotalProps {
  customerId: string;
}

const Total = ({ customerId }: TotalProps) => {
  const [startDate, setStartDate] = useState(moment().startOf("day"));
  const [endDate, setEndDate] = useState(moment().endOf("day"));
  const [startDateForm, setStartDateForm] = useState(moment().startOf("day").format("YYYY-MM-DD"));
  const [endDateForm, setEndDateForm] = useState(moment().endOf("day").format("YYYY-MM-DD"));
  const [useCustomRange, setUseCustomRange] = useState(false);

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
    `${compressedToggleButtonGroupPrefix}__1`
  );

  const toggleButtonsCompressed = [
    { id: `${compressedToggleButtonGroupPrefix}__0`, label: "1 хоног" },
    { id: `${compressedToggleButtonGroupPrefix}__1`, label: "7 хоног" },
    { id: `${compressedToggleButtonGroupPrefix}__2`, label: "1 сар" },
    { id: `${compressedToggleButtonGroupPrefix}__3`, label: "1 жил" },
  ];

  const periodMap = {
    [`${compressedToggleButtonGroupPrefix}__0`]: "1d",
    [`${compressedToggleButtonGroupPrefix}__1`]: "7d",
    [`${compressedToggleButtonGroupPrefix}__2`]: "1m",
    [`${compressedToggleButtonGroupPrefix}__3`]: "1y",
  };

  const selectedPeriod = periodMap[toggleCompressedIdSelected];

  const { analyticsData, isAnalyticsLoading, analyticsError, refreshAnalytics } =
    useGetAnalytics(
      useCustomRange ? null : selectedPeriod,
      useCustomRange ? { start: startDateForm, end: endDateForm } : {},
      customerId
    );

  const measurementMap: Record<string, string> = {
    sends: "Нийт илгээсэн тоо",
    opens: "Нээсэн тоо",
    open_rate: "Нээсэн үзүүлэлт",
    click_rate: "Дарагдсан үзүүлэлт",
    clicks: "Нийт дарсан тоо",
  };

  const emptyArr = [
    { title: "Нийт илгээсэн тоо", value: 0 },
    { title: "Нээсэн тоо", value: 0 },
    { title: "Нээсэн үзүүлэлт", value: 0 },
    { title: "Дарагдсан үзүүлэлт", value: 0 },
    { title: "Нийт дарсан тоо", value: 0 },
  ];

  const onChangeCompressed = (optionId: string) => {
    setToggleCompressedIdSelected(optionId);
    setUseCustomRange(false);

    const period = periodMap[optionId];
    let start = moment().startOf("day");
    let end = moment().endOf("day");

    switch (period) {
      case "1d":
        start = moment().startOf("day");
        break;
      case "7d":
        start = moment().subtract(7, "days").startOf("day");
        break;
      case "1m":
        start = moment().subtract(1, "months").startOf("day");
        break;
      case "1y":
        start = moment().subtract(1, "years").startOf("day");
        break;
    }

    setStartDate(start);
    setEndDate(end);
    setStartDateForm(start.format("YYYY-MM-DD"));
    setEndDateForm(end.format("YYYY-MM-DD"));
  };

  const onDateChange = (type: "start" | "end", date: moment.Moment | null) => {
    if (!date) return;
    setUseCustomRange(true);
    const formattedDate = date.format("YYYY-MM-DD");

    if (type === "start") {
      setStartDate(date);
      setStartDateForm(formattedDate);
    } else {
      setEndDate(date);
      setEndDateForm(formattedDate);
    }
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
          />
        </EuiFlexItem>
      ));
    }

    if (analyticsData?.data && analyticsData.data.length > 0) {
      return analyticsData.data.map((item, index) => (
        <EuiFlexItem key={`data-${index}-${item._measurement}`}>
          <EuiCard
            textAlign="left"
            title={measurementMap[item._measurement] || item._measurement}
            titleSize="xs"
            display="subdued"
            footer={
              <EuiFlexGroup justifyContent="flexEnd">
                <EuiFlexItem grow={false}>
                  <div style={card}>{item._value}</div>
                </EuiFlexItem>
              </EuiFlexGroup>
            }
          />
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
        />
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
            <EuiFlexGroup justifyContent="flexStart">
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
                <EuiDatePickerRange
                  startDateControl={
                    <EuiDatePicker
                      selected={startDate}
                      onChange={(date) => onDateChange("start", date)}
                      startDate={startDate}
                      endDate={endDate}
                      aria-label="Start date"
                    />
                  }
                  endDateControl={
                    <EuiDatePicker
                      selected={endDate}
                      onChange={(date) => onDateChange("end", date)}
                      startDate={startDate}
                      endDate={endDate}
                      aria-label="End date"
                    />
                  }
                />
              </EuiFlexItem>
            </EuiFlexGroup>
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
