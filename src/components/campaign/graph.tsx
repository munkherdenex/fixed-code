import {
  Chart,
  Settings,
  DARK_THEME,
  LIGHT_THEME,
  Axis,
  ScaleType,
  Position,
  BarSeries,
} from "@elastic/charts";
import {
  EuiButtonGroup,
  EuiDatePicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSkeletonRectangle,
  useEuiTheme,
} from "@elastic/eui";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCampaignContext } from "../../store/campaign_store";
import analyticsApi from "@/api/analytics";
import { css } from "@emotion/react";
import { dateFormat, generateChartIntervals, groupBy } from "@/utils/chart_utils";

const intervalMaps = {
  "button-1d": "1d",
  "button-7d": "7d",
  "button-1m": "1m",
  "button-1y": "1y",
};

const Graph = () => {
  const { data: campaignData } = useCampaignContext();
  const { colorMode } = useEuiTheme();
  const [startDate, setStartDate] = useState(null);
  const [minDate, setMinDate] = useState(moment());
  const [maxDate, setMaxDate] = useState(moment());
  const [selectedInterval, setSelectedInterval] = useState("1d");

  const isDarkTheme = colorMode === "DARK";
  const chartBaseTheme = isDarkTheme ? DARK_THEME : LIGHT_THEME;

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  const loadData = useCallback(async ({ campaignId, beginDate, interval }) => {
    setIsLoading(true);
    analyticsApi
      .getForTemplate({
        templateId: campaignId,
        start: dateFormat(beginDate, true),
        interval: interval,
      })
      .then((res) => {
        setData(res.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadData({
      campaignId: campaignData.id,
      beginDate: startDate,
      interval: intervalMaps[selectedInterval],
    });
  }, [loadData, startDate, campaignData, selectedInterval]);

  const xDomainValues = useMemo(() => {
    if (!data) return [];

    return generateChartIntervals(
      data.current_range.start,
      data.current_range.end,
      data.current_range.window,
    );
  }, [data]);

  const chartData = useMemo(() => {
    if (!data) return {};
    // Perform complex data processing here
    const timeFormattedData = data["data"].map((item) => {
      return {
        ...item,
        timestamp: dateFormat(item._time, data["current_range"]["window"] != "1h"),
      };
    });
    return groupBy(timeFormattedData, "_measurement");
  }, [data]);

  const intervalButtons = useMemo(() => {
    if (!data) return [];
    return [
      {
        id: "button-1d",
        label: "1 өдөр",
        value: "1d",
      },
      {
        id: `button-7d`,
        label: "1 долоо хоног",
        value: "7d",
      },
      {
        id: `button-1m`,
        label: "1 сар",
        isDisabled: true,
        value: "1m",
      },
      {
        id: `button-1y`,
        label: "1 жил",
        isDisabled: true,
        value: "1y",
      },
      {
        id: `button-all`,
        label: `Нийт (${dateFormat(data["total_range"]["start"])} ~ ${dateFormat(data["total_range"]["end"])})`,
        value: "all",
      },
    ];
  }, [data]);

  useEffect(() => {
    if (data) {
      setStartDate(data["current_range"]["start"] || undefined);

      setMinDate(moment(data["total_range"]["start"]) || undefined);
      setMaxDate(moment(data["total_range"]["end"]) || undefined);

      //  ['1d', '7d', '1m', '1y']
      if (data["current_range"]["window"] == "1h") {
        setSelectedInterval("button-1d");
      } else if (data["current_range"]["window"] == "1h") {
        setSelectedInterval("button-7d");
      } else if (data["current_range"]["window"] == "1m") {
        setSelectedInterval("button-1d");
      } else if (data["current_range"]["window"] == "1y") {
        setSelectedInterval("button-1d");
      }
    }
  }, [data]);

  const updateInterval = (optionId, value) => {
    setSelectedInterval(optionId);
  };

  return (
    <div>
      <EuiFlexGroup
        css={css`
          margin-bottom: 20px;
        `}
      >
        <EuiFlexItem grow={0}>
          <EuiDatePicker
            disabled={isLoading}
            selected={moment(startDate)}
            minDate={minDate}
            maxDate={maxDate}
            onChange={setStartDate}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={0}>
          <EuiButtonGroup
            isDisabled={isLoading}
            buttonSize="m"
            legend="Graph intervals"
            type="single"
            idSelected={selectedInterval}
            options={intervalButtons}
            onChange={updateInterval}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSkeletonRectangle isLoading={isLoading} width="100%" height={450}>
        <Chart size={["100%", 450]}>
          <Settings
            baseTheme={chartBaseTheme}
            showLegend
            legendPosition={Position.Right}
            xDomain={xDomainValues}
            onBrushEnd={(domain) => {
              console.log(domain);
            }}
          />
          <Axis id="count" title="Тоо" position={Position.Left} domain={{ min: 0, max: 410 }} />
          <Axis id="time" title="Хугацаа" position={Position.Bottom} />
          {chartData &&
            Object.keys(chartData).map((key, index) => {
              return (
                <BarSeries
                  key={`react__node-id-bars-${index}`}
                  id={`bars-${index}`}
                  name={`Илгээсэн-${key}`}
                  xScaleType={ScaleType.Linear}
                  xAccessor="timestamp"
                  yAccessors={["_value"]}
                  data={chartData[key]}
                />
              );
            })}
        </Chart>
      </EuiSkeletonRectangle>
    </div>
  );
};

export default Graph;
