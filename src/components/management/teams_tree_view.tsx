import { useContext } from "react";
import { teamsContext } from "../../store/teams_store";
import { convertToTree } from "../../utils/convertToTree";
import RecursiveTree from "../recursive_tree";

const TeamsTreeView = () => {
  const { teams, changeCurrentTeam, currentTeam } = useContext(teamsContext);
  const items = convertToTree(teams, changeCurrentTeam, currentTeam);

  return <RecursiveTree tree={items} />;
};

export default TeamsTreeView;
