import {
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiBreadcrumbs,
  EuiButton,
  EuiTableFieldDataColumnType,
  useEuiTheme,
} from "@elastic/eui";
import moment from "moment";
import Head from "next/head";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import useSegmentsList, { Segment } from "../../../hooks/useSegmentsList";
import DashboardLayout from "../../../layouts/dashboard";
import { dashboardsStyles } from "../../../styles/dashboards.styles";

const pathPrefix = process.env.PATH_PREFIX;

const Dashboard: FunctionComponent = () => {
  const { euiTheme } = useEuiTheme();
  const router = useRouter();
  const styles = dashboardsStyles(euiTheme);
  const { data, isLoading } = useSegmentsList();
  const columns: Array<EuiBasicTableColumn<Segment>> = [
    {
      field: "id",
      name: "ID",
      "data-test-subj": "idCell",
      mobileOptions: {
        render: (segment: Segment) => <>{segment.id}</>,
        enlarge: true,
      },
    },
    {
      field: "name",
      name: "Name",
      "data-test-subj": "nameCell",
      mobileOptions: {
        render: (segment: Segment) => <>{segment.name}</>,
        enlarge: true,
      },
    },
    {
      field: "description",
      name: "Description",
      "data-test-subj": "descriptionCell",
      mobileOptions: {
        render: (segment: Segment) => <>{segment.description}</>,
        enlarge: true,
      },
    },
    {
      field: "type",
      name: "Type",
      "data-test-subj": "typeCell",
      mobileOptions: {
        render: (segment: Segment) => <>{segment.type}</>,
        enlarge: true,
      },
    },
    {
      field: "created_at",
      name: "Created at",
      "data-test-subj": "createdAtCell",
      mobileOptions: {
        render: (segment: Segment) => moment(segment.updated_at).format("YYYY-MM-DD HH:mm:ss"),
        enlarge: true,
      },
    },
  ];

  const getRowProps = (segment: Segment) => {
    const { id } = segment;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => {
        router.push(`${pathPrefix}/dashboards/segments/info/${id}`);
      },
    };
  };

  const getCellProps = (segment: Segment, column: EuiTableFieldDataColumnType<Segment>) => {
    const { id } = segment;
    const { field } = column;

    return {
      className: "customCellClass",
      "data-test-subj": `cell-${id}-${String(field)}`,
      textOnly: true,
    };
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Create segments</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Segments",
          iconType: "dashboardApp",
          rightSideItems: [
            <EuiButton
              color="primary"
              onClick={() => router.push(`${pathPrefix}/dashboards/segments/create`)}
              fill
              key="create-segment"
            >
              Create segment
            </EuiButton>,
          ],
        }}
        breadCrumb={
          <EuiBreadcrumbs
            breadcrumbs={[
              {
                text: "Dashboards",
                onClick: () => router.push(`${pathPrefix}/dashboards`),
              },
              {
                text: "Segments",
              },
            ]}
            truncate={false}
          />
        }
      >
        <div css={styles.container}>
          <EuiBasicTable
            tableCaption="Demo of EuiBasicTable"
            items={data || []}
            rowHeader="firstName"
            columns={columns}
            rowProps={getRowProps}
            cellProps={getCellProps}
          />
        </div>
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
