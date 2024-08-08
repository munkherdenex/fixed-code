import { EuiTreeView } from "@elastic/eui";
import { useContext } from "react";
import { teamsContext } from "../../store/teams_store";
import { convertToTree } from "../../utils/convertToTree";

const TeamsTreeView = () => {
  const { teams, changeCurrentTeam, currentTeam } = useContext(teamsContext);
  const items = convertToTree(teams, changeCurrentTeam, currentTeam);

  return <EuiTreeView items={items} aria-label="Teams Tree View" />;
};

export default TeamsTreeView;
