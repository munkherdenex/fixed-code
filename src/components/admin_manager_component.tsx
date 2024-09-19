import { useContext } from "react";
import { teamsContext } from "../store/teams_store";

const AdminManagerComponent = ({ children }) => {
  const { myProfile } = useContext(teamsContext);

  if (
    (myProfile?.role === "admin" || myProfile?.role === "manager") &&
    myProfile?.status === "active"
  ) {
    return children;
  }

  return <></>;
};

export default AdminManagerComponent;
