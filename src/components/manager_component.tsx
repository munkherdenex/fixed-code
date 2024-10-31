import { useContext } from "react";
import { teamsContext } from "../store/teams_store";

const ManagerComponent = ({ children }) => {
  const { isManager, isAccountActive } = useContext(teamsContext);

  if (isManager && isAccountActive) {
    return children;
  }

  return <></>;
};

export default ManagerComponent;
