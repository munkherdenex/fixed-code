import {
  AreaSeries,
  Axis,
  BarSeries,
  Chart,
  DARK_THEME,
  DataGenerator,
  LIGHT_THEME,
  LineSeries,
  PartialTheme,
  Position,
  ScaleType,
  Settings,
  Tooltip,
} from "@elastic/charts";
import {
  EuiBreadcrumbs,
  EuiColorPalettePicker,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  euiPaletteColorBlind,
  euiPaletteComplementary,
  euiPaletteCool,
  euiPaletteForDarkBackground,
  euiPaletteForLightBackground,
  euiPaletteForStatus,
  euiPaletteForTemperature,
  euiPaletteGray,
  euiPaletteGreen,
  euiPaletteRed,
  euiPaletteWarm,
  EuiPanel,
  EuiSpacer,
  EuiStat,
  EuiText,
  useEuiTheme,
} from "@elastic/eui";
import Head from "next/head";
import router from "next/router";
import { useState } from "react";
import DashboardLayout from "../../../layouts/dashboard";

const paletteData = {
  euiPaletteColorBlind,
  euiPaletteForStatus,
  euiPaletteForTemperature,
  euiPaletteComplementary,
  euiPaletteRed,
  euiPaletteGreen,
  euiPaletteCool,
  euiPaletteWarm,
  euiPaletteGray,
};

const palettes = Object.entries(paletteData).map(([paletteName, palette]) => {
  return {
    value: paletteName,
    title: paletteName,
    palette:
      palette === euiPaletteColorBlind ? euiPaletteColorBlind({ sortBy: "natural" }) : palette(10),
    type: "fixed" as const,
  };
});

/**
 * Example sparkline styles to match `ThemeService.useSparklineOverrides` from kibana `charts` plugin
 *
 * See https://github.com/elastic/kibana/blob/82fdf0414d61a1419038eed395bcdf941d72a58c/src/plugins/charts/public/services/theme/theme.ts#L55-L77
 */
const sparklineOverrides: PartialTheme = {
  lineSeriesStyle: {
    point: {
      visible: false,
      strokeWidth: 1,
      radius: 1,
    },
  },
  areaSeriesStyle: {
    point: {
      visible: false,
      strokeWidth: 1,
      radius: 1,
    },
  },
};

const TIME_DATA_SMALL = [
  [1551438630000, 8.515625],
  [1551438660000, 10.796875],
  [1551438690000, 11.125],
  [1551438720000, 21.40625],
  [1551438750000, 17.921875],
  [1551438780000, 26.640625],
  [1551438810000, 31.390625],
  [1551438840000, 23.953125],
];

const TIME_DATA_SMALL_REVERSE = [...TIME_DATA_SMALL].reverse();

const TIME_DATA_MAJOR = [...TIME_DATA_SMALL_REVERSE];
const lastIndex = TIME_DATA_MAJOR.length - 1;
TIME_DATA_MAJOR[lastIndex] = [...TIME_DATA_MAJOR[lastIndex]];
TIME_DATA_MAJOR[lastIndex][1] = -100;

const data = [
  { x: "trousers", y: 390, val: 1222 },
  { x: "watches", y: 23, val: 1222 },
  { x: "bags", y: 750, val: 1222 },
  { x: "cocktail dresses", y: 854, val: 1222 },
];

const Analytics = () => {
  const { colorMode } = useEuiTheme();
  const isDarkTheme = colorMode === "DARK";
  const chartBaseTheme = isDarkTheme ? DARK_THEME : LIGHT_THEME;
  const [barPalette, setBarPalette] = useState("euiPaletteColorBlind");

  /**
   * Create data
   */
  const dg = new DataGenerator();
  const data1 = dg.generateGroupedSeries(20, 1);
  const data2 = dg.generateGroupedSeries(20, 5);

  const themeOverrides =
    barPalette !== "euiPaletteColorBlind"
      ? [
          {
            colors: {
              vizColors: paletteData[barPalette as keyof typeof paletteData](5),
            },
          },
        ]
      : [];

  return (
    <>
      <Head>
        <title>Audience</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Analytics",
          iconType: "reportingApp",
        }}
        breadCrumb={
          <EuiBreadcrumbs
            breadcrumbs={[
              {
                text: "Dashboards",
                onClick: () => router.push(`/dashboards`),
              },
              {
                text: "Audience",
              },
            ]}
            truncate={false}
            aria-label="Customer info breadCrumb"
          />
        }
      >
        <div>
          <Chart size={["100%", 500]}>
            <Settings baseTheme={chartBaseTheme} />
            <Axis id="count" title="count" position={Position.Left} />
            <Axis id="x" title="goods" position={Position.Bottom} />
            <BarSeries
              id="bars"
              name="amount"
              xScaleType={ScaleType.Ordinal}
              xAccessor="x"
              yAccessors={["y"]}
              data={data}
            />
          </Chart>
          <>
            <Chart size={{ height: 200 }}>
              <Settings baseTheme={chartBaseTheme} theme={themeOverrides} showLegend={false} />
              <BarSeries
                id="status"
                name="Status"
                data={data2}
                xAccessor={"x"}
                yAccessors={["y"]}
                splitSeriesAccessors={["g"]}
                stackAccessors={["g"]}
              />
              <LineSeries
                id="control"
                name="Control"
                data={data1}
                xAccessor={"x"}
                yAccessors={["y"]}
                color={["black"]}
              />
              <Axis id="bottom-axis" position="bottom" gridLine={{ visible: true }} />
              <Axis
                id="left-axis"
                position="left"
                gridLine={{ visible: true }}
                tickFormat={(d) => Number(d).toFixed(2)}
              />
            </Chart>
            <EuiSpacer size="xxl" />
            <EuiFlexGroup justifyContent="center">
              <EuiFlexItem grow={false} style={{ width: 300 }}>
                <EuiColorPalettePicker
                  palettes={palettes}
                  onChange={setBarPalette}
                  valueOfSelected={barPalette}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size="xxl" />
            <EuiFlexGrid columns={4} responsive={false}>
              <EuiFlexItem>
                <EuiPanel>
                  <EuiStat title="" description="Number of things" textAlign="right">
                    <EuiSpacer size="s" />
                    <Chart size={{ height: 64 }}>
                      <Settings
                        baseTheme={chartBaseTheme}
                        theme={sparklineOverrides}
                        showLegend={false}
                      />
                      <Tooltip type="none" />
                      <BarSeries
                        id="numbers"
                        data={TIME_DATA_SMALL}
                        xAccessor={0}
                        yAccessors={[1]}
                        color={[
                          isDarkTheme
                            ? euiPaletteForDarkBackground()[1]
                            : euiPaletteForLightBackground()[1],
                        ]}
                      />
                    </Chart>
                  </EuiStat>
                </EuiPanel>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiPanel>
                  <EuiStat
                    title=""
                    description="Increase over time"
                    titleColor="success"
                    textAlign="right"
                  >
                    <EuiSpacer size="s" />
                    <Chart size={{ height: 48 }}>
                      <Settings
                        baseTheme={chartBaseTheme}
                        theme={sparklineOverrides}
                        showLegend={false}
                      />
                      <Tooltip type="none" />
                      <LineSeries
                        id="increase"
                        data={TIME_DATA_SMALL}
                        xAccessor={0}
                        yAccessors={[1]}
                        color={[
                          isDarkTheme
                            ? euiPaletteForDarkBackground()[1]
                            : euiPaletteForLightBackground()[1],
                        ]}
                      />
                    </Chart>
                    <EuiSpacer size="s" />
                    <EuiText size="xs" color="success">
                      <EuiIcon type="sortUp" /> <strong>15%</strong>
                    </EuiText>
                  </EuiStat>
                </EuiPanel>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiPanel>
                  <EuiStat
                    title={
                      <span>
                        <EuiIcon size="xl" type="sortDown" /> 15%
                      </span>
                    }
                    description="Major decrease over time"
                    titleColor="danger"
                    textAlign="right"
                  >
                    <EuiSpacer size="s" />
                    <Chart size={{ height: 16 }}>
                      <Settings
                        baseTheme={chartBaseTheme}
                        theme={sparklineOverrides}
                        showLegend={false}
                      />
                      <Tooltip type="none" />
                      <LineSeries
                        id="major"
                        data={TIME_DATA_MAJOR}
                        xAccessor={0}
                        yAccessors={[1]}
                        color={[
                          isDarkTheme
                            ? euiPaletteForDarkBackground()[3]
                            : euiPaletteForLightBackground()[3],
                        ]}
                      />
                    </Chart>
                  </EuiStat>
                </EuiPanel>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiPanel>
                  <EuiStat
                    title=""
                    description="Subtle decrease"
                    titleColor="danger"
                    textAlign="right"
                  >
                    <EuiSpacer size="s" />
                    <Chart size={{ height: 48 }}>
                      <Settings
                        baseTheme={chartBaseTheme}
                        theme={sparklineOverrides}
                        showLegend={false}
                      />
                      <Tooltip type="none" />
                      <AreaSeries
                        id="subtle"
                        data={TIME_DATA_SMALL_REVERSE}
                        xAccessor={0}
                        yAccessors={[1]}
                        color={[
                          isDarkTheme
                            ? euiPaletteForDarkBackground()[3]
                            : euiPaletteForLightBackground()[3],
                        ]}
                      />
                    </Chart>
                    <EuiSpacer size="s" />
                    <EuiText size="xs" color="danger">
                      - 15 points since last Tuesday
                    </EuiText>
                  </EuiStat>
                </EuiPanel>
              </EuiFlexItem>
            </EuiFlexGrid>
          </>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Analytics;
