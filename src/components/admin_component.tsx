import { ReactElement, useContext } from "react";
import { teamsContext } from "../store/teams_store";
import NoPermission from "./no_permission";

const AdminComponent = ({
  page,
  children,
}: {
  page?: boolean;
  children: ReactElement;
  message?: string;
}) => {
  const { isAdmin, isAccountActive } = useContext(teamsContext);

  if (isAdmin && isAccountActive) {
    return children;
  }

  if (page) {
    return <NoPermission />;
  }

  return <></>;
};

export default AdminComponent;
