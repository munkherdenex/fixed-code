import { EuiButton, EuiFlexItem } from "@elastic/eui";
import { useRouter } from "next/router";
import { useManagementTeamsContext } from "../../store/management_teams_store";
import { useTranslations } from "next-intl";

const CreateSubTeam = () => {
  const router = useRouter();
  const translate = useTranslations();
  const { currentTeam, isAdmin } = useManagementTeamsContext();

  const isParentTeam = currentTeam?.parent_id === null;

  if (isAdmin && isParentTeam) {
    return (
      <EuiFlexItem>
        <EuiButton
          onClick={async () => {
            if (isAdmin) {
              router.push({
                pathname: "/dashboards/settings/team/sub/create",
                query: { id: currentTeam?.id },
              });
            }
          }}
        >
          {translate("create_sub_team")}
        </EuiButton>
      </EuiFlexItem>
    );
  }

  return null;
};

export default CreateSubTeam;
