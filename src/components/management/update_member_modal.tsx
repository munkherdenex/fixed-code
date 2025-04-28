import { addToast } from "../toast";
import useGetCurrentTeamMembers from "../../hooks/useCurrentTeamMembers";
import useUpdateMemberRole from "../../hooks/useUpdateMemberRole";
import { EuiButtonIcon } from "@elastic/eui";
import { useManagementTeamsContext } from "../../store/management_teams_store";

const UpdateMemberModal = ({
  selectMemberId,
  changed_role,
}: {
  selectMemberId: string | any;
  changed_role: string;
}) => {
  const { currentTeam } = useManagementTeamsContext();
  const { mutateTeamMembers } = useGetCurrentTeamMembers(currentTeam);
  const { trigger, isMutating } = useUpdateMemberRole(selectMemberId);

  const changeMemberRole = async (role: string) => {
    try {
      const preparedData = {
        role: role,
      };
      const response = await trigger(preparedData);
      if (response) {
        mutateTeamMembers();
        addToast({
          id: "member-success",
          color: "success",
          title: "Success",
          text: "Successfully changed",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <EuiButtonIcon
      isLoading={isMutating}
      iconType="save"
      value="Save"
      onClick={() => {
        changeMemberRole(changed_role);
      }}
    />
  );
};

export default UpdateMemberModal;
