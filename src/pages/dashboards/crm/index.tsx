import { GetStaticProps } from "next/types";
import DashboardCRMLayout from "../../../layouts/dashboard_crm";
import {
  EuiBadge,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiCard,
  EuiDatePicker,
  EuiDatePickerRange,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiSpacer,
  EuiText,
} from "@elastic/eui";
import { DARK_THEME, LIGHT_THEME, PartialTheme } from "@elastic/charts";
import {
  Axis,
  BarSeries,
  Chart,
  Position,
  ScaleType,
  Settings,
  LineSeries,
  Partition,
  PartitionLayout,
} from "@elastic/charts";
import useGetCRMDashboardData from "@/hooks/useGetCRMDashboardData";
import { useEffect, useState } from "react";
import moment, { Moment } from "moment";
import { useRouter } from "next/router";

// // Example data for a line chart
// const myData = [
//   { x: 0, y: 3 },
//   { x: 1, y: 7 },
//   { x: 2, y: 4 },
//   { x: 3, y: 9 },
// ];

// // Example data for a bar chart with categories
// const categoryData = [
//   { x: "Category A", y: 10 },
//   { x: "Category B", y: 15 },
//   { x: "Category C", y: 8 },
// ];

// // Example data for time-series data
// const timeSeriesData = [
//   { x: new Date("2024-01-01T00:00:00Z").getTime(), y: 100 },
//   { x: new Date("2024-01-01T01:00:00Z").getTime(), y: 150 },
//   { x: new Date("2024-01-01T02:00:00Z").getTime(), y: 120 },
// ];

const CRM = () => {
  const router = useRouter();
  const chartBaseTheme = LIGHT_THEME;
  const [startDate, setStartDate] = useState(moment().subtract(7, "d"));
  const [endDate, setEndDate] = useState(moment());
  const [statusCounts, setStatusCounts] = useState(null);
  const [dailyCounts, setDailyCounts] = useState(null);
  const [tickets, setTickets] = useState(null);
  const [mappedDailyCountsForChart, setMappedDailyCountsForChart] = useState([]);
  const [mappedTicketForChart, setMappedTicketForChart] = useState([]);
  const [filters, setFilters] = useState(null);
  const [role, setRole] = useState(null);
  const [totalDailyCount, setTotalDailyCount] = useState(0);
  const [pieChartData, setPieChartData] = useState([]);

  const { dashBoardData, dashBoardDataError, isDashBoardDataLoading, refreshDashBoardData } =
    useGetCRMDashboardData({
      start_date: startDate.format("YYYY-MM-DD"),
      end_date: endDate.format("YYYY-MM-DD"),
    });

  useEffect(() => {
    if (dashBoardData) {
      setStatusCounts(dashBoardData.status_counts);
      setDailyCounts(dashBoardData.daily_counts);
      setFilters(dashBoardData.filters);
      setTickets(dashBoardData.tickets);
      setRole(dashBoardData.role);
      // Ticket
      const transformedDailyCounts = Object.entries(dashBoardData.daily_counts).map(
        ([day, count]) => ({
          x: day,
          y: count,
          val: 10,
        }),
      );
      setMappedDailyCountsForChart(transformedDailyCounts);
      // Ticket Tuluv
      const transformedData = Object.entries(dashBoardData.status_counts).map(
        ([statusName, count]) => ({
          name: statusName.charAt(0).toUpperCase() + statusName.slice(1),
          value: count,
        }),
      );
      setPieChartData(transformedData);

      if (dashBoardData && dashBoardData.daily_counts) {
        const dailyCounts = dashBoardData.daily_counts;

        const sum = Object.values(dailyCounts).reduce((acc, currentCount) => acc + currentCount, 0);

        setTotalDailyCount(sum);
      }
    }
  }, [dashBoardData]);

  const themeOverrides: PartialTheme = {
    partition: { emptySizeRatio: 0.4 },
  };

  const columns: Array<EuiBasicTableColumn<any>> = [
    {
      field: "id",
      name: "Тикет ID",
      render: (id) => <>{"#" + id}</>,
    },
    {
      field: "tags",
      name: "Төрөл",
      render: (tags) =>
        tags.length > 0 ? <EuiBadge color="hollow">{tags[0]?.name}</EuiBadge> : null,
    },
    {
      field: "status",
      name: "Төлөв",
      render: (status) => (
        <EuiBadge color={status == "open" ? "success" : "danger"} iconType="dot">
          {status == "open" ? "Нээлттэй" : status == "processing" ? "Шалгагдаж байгаа" : "Хаалттай"}
        </EuiBadge>
      ),
    },
    {
      field: "priority",
      name: "Чухлын зэрэг",
      render: (prio) =>
        prio ? (
          <EuiBadge color={prio.id == 1 ? "danger" : prio.id == 4 ? "warning" : "primary"}>
            {prio.name}
          </EuiBadge>
        ) : null,
    },
  ];

  const getRowProps = (template) => {
    const { id } = template;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => router.push(`/dashboards/crm/ticket/${id}`),
    };
  };

  const getCellProps = (template, column) => {
    const { id } = template;
    const { field } = column;

    return {
      className: "customCellClass",
      "data-test-subj": `cell-${id}-${String(field)}`,
      textOnly: true,
    };
  };

  if (dashBoardDataError) return <div>Failed to load</div>;
  if (!dashBoardData) return <div>Loading...</div>;

  return (
    <>
      <DashboardCRMLayout
        pageHeader={{
          pageTitle: "Сайн байна уу?",
        }}
      >
        <>
          {/* Date Filter */}
          <EuiFlexGroup>
            <EuiFlexItem grow={true}>
              <EuiDatePickerRange
                startDateControl={
                  <EuiDatePicker
                    selected={startDate}
                    onChange={(date) => date && setStartDate(date)}
                    startDate={startDate}
                    endDate={endDate}
                    aria-label="Start date"
                  />
                }
                endDateControl={
                  <EuiDatePicker
                    selected={endDate}
                    onChange={(date) => date && setEndDate(date)}
                    startDate={startDate}
                    endDate={endDate}
                    aria-label="End date"
                  />
                }
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="s" />
          {/* Main Chart body */}
          <EuiFlexGroup>
            <EuiFlexItem grow={true}>
              <EuiCard
                textAlign="left"
                title=""
                description={
                  <>
                    <EuiFlexGroup direction="column">
                      <EuiFlexItem grow={true}>
                        <EuiText color="gray" size="s">
                          Статистик
                        </EuiText>
                        <EuiText>
                          <h3>Тикет</h3>
                        </EuiText>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                    <EuiHorizontalRule margin="xs" />
                    <EuiText size="s">
                      <b>Нийт: {totalDailyCount}</b>
                    </EuiText>
                  </>
                }
              >
                <Chart size={{ width: "100%", height: 200 }}>
                  <Settings showLegend={false} baseTheme={chartBaseTheme} />
                  <Axis id="bottom" position="bottom" />
                  <Axis id="left" position="left" />
                  <BarSeries
                    id="daily-bars"
                    name="Тикет"
                    xScaleType="ordinal"
                    yScaleType="linear"
                    xAccessor="x"
                    yAccessors={["y"]}
                    data={mappedDailyCountsForChart}
                  />
                </Chart>
              </EuiCard>
            </EuiFlexItem>
            <EuiFlexItem grow={true}>
              <EuiCard
                textAlign="left"
                title=""
                description={
                  <>
                    <EuiFlexGroup direction="column">
                      <EuiFlexItem grow={true}>
                        <EuiText color="gray" size="s">
                          Статистик
                        </EuiText>
                        <EuiText>
                          <h3>Тикетийн төлөв</h3>
                        </EuiText>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                    <EuiHorizontalRule margin="xs" />
                  </>
                }
              >
                <Chart size={{ width: "100%", height: 200 }}>
                  <Settings showLegend={true} baseTheme={chartBaseTheme} theme={themeOverrides} />
                  <Partition
                    id="status_pie_chart"
                    data={pieChartData}
                    layout={PartitionLayout.sunburst}
                    valueAccessor={(d) => d.value}
                    layers={[
                      {
                        groupByRollup: (d) => d.name,
                        shape: {
                          fillColor: (_, sortIndex) => chartBaseTheme.colors.vizColors![sortIndex],
                        },
                      },
                    ]}
                  />
                </Chart>
              </EuiCard>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiFlexGroup>
            {/* Role */}
            {role == "member" ? (
              <EuiFlexItem grow={true}>
                <EuiSpacer size="s" />
                <EuiCard textAlign="left" title="">
                  <>
                    <EuiSpacer size="s" />
                    <EuiBasicTable
                      tableCaption="Campaign table"
                      items={tickets || []}
                      columns={columns}
                      rowProps={getRowProps}
                      cellProps={getCellProps}
                    />
                  </>
                </EuiCard>
              </EuiFlexItem>
            ) : null}
          </EuiFlexGroup>
        </>
      </DashboardCRMLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const common = (await import(`../../../messages/${context.locale}/common.json`)).default;
  const campaign = (await import(`../../../messages/${context.locale}/campaign.json`)).default;

  return {
    props: {
      messages: {
        ...common,
        ...campaign,
      },
    },
  };
};

export default CRM;
