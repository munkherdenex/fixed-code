import { useContext } from "react";
import { teamsContext } from "../store/teams_store";

const AdminManagerComponent = ({ children }) => {
  const { myProfile } = useContext(teamsContext);
  const isManager = myProfile?.role === "manager";
  const isAdmin = myProfile?.role === "admin";
  const isActive = myProfile?.status === "active";

  if ((isAdmin || isManager) && isActive) {
    return children;
  }

  return <></>;
};

export default AdminManagerComponent;
