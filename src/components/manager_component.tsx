import { useContext } from "react";
import { teamsContext } from "../store/teams_store";

const ManagerComponent = ({ children }) => {
  const { myProfile } = useContext(teamsContext);

  if (myProfile?.role === "manager" && myProfile?.status === "active") {
    return children;
  }

  return <></>;
};

export default ManagerComponent;
