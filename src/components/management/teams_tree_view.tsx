import { useContext, useMemo } from "react";
import { teamsContext } from "../../store/teams_store";
import { convertToTree } from "../../utils/convertToTree";
import RecursiveTree from "../recursive_tree";

const TeamsTreeView = () => {
  const { teams, changeCurrentTeam, currentTeam } = useContext(teamsContext);
  const items = useMemo(
    () => convertToTree(teams, changeCurrentTeam, currentTeam),
    [teams, currentTeam, changeCurrentTeam],
  );

  if (teams?.length === 0) {
    return <></>;
  }

  return <RecursiveTree tree={items} />;
};

export default TeamsTreeView;
