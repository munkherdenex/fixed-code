import {
  EuiAvatar,
  EuiBadge,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSelect,
  EuiText,
  EuiToolTip,
} from "@elastic/eui";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { MembersType, TeamMembersType } from "../../constants/members.types";
import useGetCurrentTeamMembers from "../../hooks/useCurrentTeamMembers";
import { teamsContext } from "../../store/teams_store";
import { logColor } from "../../utils/badge_color";
import { logIcon } from "../../utils/log_icon";
import DeleteMemberModal from "./delete_member_modal";
import UpdateMemberModal from "./update_member_modal";

const MembersTable = () => {
  const { data: teamMembers, isLoading: isMembersLoading } =
    useGetCurrentTeamMembers<TeamMembersType>();
  const { myProfile } = useContext(teamsContext);

  const isAdmin = myProfile?.role === "admin";

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectMemberId, setSelectedMemberId] = useState<any>();
  const [teamRole, setTeamRole] = useState([]);

  const roleTypes = [
    { value: "admin", text: "Admin" },
    { value: "member", text: "Member" },
    { value: "manager", text: "Manager" },
  ];

  useEffect(() => {
    setTeamRole(teamMembers?.members);
  }, [teamMembers]);

  const onChange = (e, id) => {
    setTeamRole(
      teamMembers?.members?.map((value) => {
        if (value.id === id) {
          return {
            ...value,
            role: e.target.value,
          };
        }
        return value;
      }),
    );
  };

  const RoleColumn = ({ role, member }) => {
    const currentRole = teamRole?.filter((value) => value.id === member.id)[0]?.role;

    return (
      <EuiFlexItem>
        {isAdmin && (
          <EuiSelect
            id={member.user.email}
            defaultValue={role}
            options={roleTypes}
            value={currentRole}
            onChange={(event) => onChange(event, member.id)}
            prepend={
              <EuiButtonIcon iconType={logIcon(currentRole)} color={logColor(currentRole)} />
            }
            append={
              currentRole !== role && (
                <EuiToolTip content="Are you sure you want to change?">
                  <UpdateMemberModal selectMemberId={member?.id} changed_role={currentRole} />
                </EuiToolTip>
              )
            }
          />
        )}
        {!isAdmin && (
          <EuiBadge iconType={logIcon(member.role)} color={logColor(member.role)}>
            {member.role}
          </EuiBadge>
        )}
      </EuiFlexItem>
    );
  };

  const columns: Array<EuiBasicTableColumn<MembersType>> = [
    {
      field: "user.email",
      name: "Username & Email",
      render: (role: MembersType["role"], member: MembersType) => (
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            <EuiAvatar size="m" name={role || ""} />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGroup direction="column" gutterSize="none">
              <EuiFlexItem grow={false}>
                <EuiText size="s">
                  <strong>
                    {member?.user?.lname} {member?.user?.fname}
                  </strong>
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiText size="xs">{member?.user?.email}</EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      ),
    },
    {
      field: "role",
      name: "Role",
      render: (role: MembersType["role"], member: MembersType) => (
        <RoleColumn role={role} member={member} />
      ),
    },
    {
      name: "Joined Date",
      field: "joined_date",
      render: (joined_date: MembersType["joined_date"]) => (
        <EuiFlexItem>{moment(joined_date).format("YYYY-MM-DD LT")}</EuiFlexItem>
      ),
    },
    {
      name: "Status",
      field: "status",
      render: (status: MembersType["status"]) => (
        <EuiFlexItem>
          <div>
            <EuiBadge
              iconType={status === "active" ? "check" : status === "pending" ? "refresh" : ""}
              color={status === "active" ? "success" : status === "pending" ? "warning" : "white"}
            >
              {status}
            </EuiBadge>
          </div>
        </EuiFlexItem>
      ),
    },
    {
      name: `${isAdmin ? "Actions" : ""}`,
      hidden: !isAdmin,
      actions: [
        {
          name: "Delete",
          isPrimary: true,
          icon: "trash",
          color: "danger",
          type: "icon",
          description: "Delete member",
          onClick: (member: MembersType) => {
            setSelectedMemberId(member?.id);
            setIsModalVisible(true);
          },
        },
      ],
    },
  ];

  if (isMembersLoading) return <div>Loading...</div>;

  return (
    <>
      {isModalVisible && (
        <DeleteMemberModal selectMember={selectMemberId} setIsModalVisible={setIsModalVisible} />
      )}
      <EuiPanel>
        <EuiBasicTable itemId="id" items={teamMembers?.members || []} columns={columns} />
      </EuiPanel>
    </>
  );
};

export default MembersTable;
