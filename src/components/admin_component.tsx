import { useContext } from "react";
import { teamsContext } from "../store/teams_store";

const AdminComponent = ({ children }) => {
  const { myProfile } = useContext(teamsContext);

  if (myProfile?.role === "admin" && myProfile?.status === "active") {
    return children;
  }

  return <></>;
};

export default AdminComponent;
