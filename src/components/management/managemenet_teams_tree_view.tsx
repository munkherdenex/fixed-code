import { useManagementTeamsContext } from "../../store/management_teams_store";
import { convertToTree } from "../../utils/convertToTree";
import RecursiveTree from "../recursive_tree";

const ManagementTeamsTreeView = () => {
  const { currentTeam, data: teams, changeCurrentTeam } = useManagementTeamsContext();
  const items = convertToTree(teams, changeCurrentTeam, currentTeam);

  return <RecursiveTree tree={items} />;
};

export default ManagementTeamsTreeView;
