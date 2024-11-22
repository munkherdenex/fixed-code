import {
  EuiBadge,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButtonIcon,
  EuiPanel,
  EuiTextColor,
} from "@elastic/eui";
import moment from "moment";
import { useRouter } from "next/router";
import useTeams from "../../hooks/useTeams";
import { Teams } from "../../store/teams_store.types";
import { badgeColor } from "../../utils/badge_color";

const TeamsTable = () => {
  const router = useRouter();
  const { data } = useTeams<Teams[]>();

  const defaultColumn: Array<EuiBasicTableColumn<Teams>> = [
    {
      field: "name",
      name: "Name",
    },
    {
      name: "Description",
      render: (team: Teams) => (
        <div>
          {team.description ? team.description : <EuiTextColor color="subdued">None</EuiTextColor>}
        </div>
      ),
    },
    {
      name: "Type",
      render: (team: Teams) => (
        <div>
          <EuiBadge color={badgeColor(team?.parent_id ? "manager" : "APPROVED")}>
            {team?.parent_id ? "Sub team" : "Parent team"}
          </EuiBadge>
        </div>
      ),
    },
    {
      field: "created_at",
      name: "Created at",
      render: (date: string) => moment(date).format("YYYY-MM-DD LT"),
    },
    {
      field: "updated_at",
      name: "Updated at",
      render: (date: string) => moment(date).format("YYYY-MM-DD LT"),
    },
    {
      field: "id",
      name: "Actions",
      render: () => (
        <div>
          <EuiButtonIcon iconType="pencil" aria-label="Edit" />
        </div>
      ),
    },
  ];

  const getRowProps = (team: Teams) => {
    const { id } = team;
    return {
      "data-test-subj": `row-${id}`,
      className: "customRowClass",
      onClick: () => router.push(`/dashboards/settings/management/team/${id}`),
    };
  };

  return (
    <EuiPanel>
      <EuiBasicTable
        rowProps={getRowProps}
        tableLayout="auto"
        itemId="id"
        items={data || []}
        columns={defaultColumn}
      />
    </EuiPanel>
  );
};

export default TeamsTable;
