import { GetStaticProps } from "next/types";
import DashboardCRMLayout from "../../../layouts/dashboard_crm";
import { EuiText } from "@elastic/eui";
import { Axis, BarSeries, Chart, Position, ScaleType, Settings, LineSeries } from "@elastic/charts";
import useGetCRMDashboardData from "@/hooks/useGetCRMDashboardData";

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
  // const { dashBoardData, dashBoardDataError, isDashBoardDataLoading, refreshDashBoardData } =
  //   useGetCRMDashboardData(null);

  return (
    <>
      <DashboardCRMLayout
        pageHeader={{
          pageTitle: "CRM dashboard",
        }}
      >
        {/* <>
          <Chart>
            <Settings showLegend={true} />
            <Axis id="bottom" position="bottom" title="Category" />
            <Axis id="left" position="left" title="Value" />
            <BarSeries
              id="bars"
              name="Category Values"
              xScaleType="ordinal"
              yScaleType="linear"
              xAccessor="x"
              yAccessors={["y"]}
              data={categoryData}
            />
          </Chart>
        </> */}

        <div>
          <EuiText>
            <h3>Энэ хэсэгт харуулах зүйлс</h3>

            <ul>
              <li>Нээлттэй тикетүүд</li>
              <li>Дуудлагын түүх</li>
              <li>Чатны түүх</li>
            </ul>
          </EuiText>
        </div>
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
