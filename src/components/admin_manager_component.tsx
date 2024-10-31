import { ReactElement, useContext } from "react";
import { teamsContext } from "../store/teams_store";
import NoPermission from "./no_permission";

const AdminManagerComponent = ({
  page,
  children,
}: {
  page?: boolean;
  children: ReactElement;
  message?: string;
}) => {
  const { isAdmin, isManager, isAccountActive } = useContext(teamsContext);

  if ((isAdmin || isManager) && isAccountActive) {
    return children;
  }

  if (page) {
    return <NoPermission />;
  }

  return <></>;
};

export default AdminManagerComponent;
