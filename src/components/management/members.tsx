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
import { useState } from "react";
import { MembersType, TeamMembersType } from "../../constants/members.types";
import useGetCurrentTeamMembers from "../../hooks/useCurrentTeamMembers";
import useProfile from "../../hooks/useProfile";
import DeleteMemberModal from "./delete_member_modal";
import UpdateMemberModal from "./update_member_modal";

const MembersTable = () => {
  const { data: teamMembers, isLoading: isMembersLoading } =
    useGetCurrentTeamMembers<TeamMembersType>();
  const { data: user, isLoading: isProfileLoading } = useProfile();

  const isAdmin =
    teamMembers?.members?.some(
      (member) => member?.user?.email === user.email && member?.role === "admin",
    ) || false;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectMemberId, setSelectedMemberId] = useState<any>();
  const [teamRole, setTeamRole] = useState(teamMembers?.members);

  const roleTypes = [
    { value: "admin", text: "Admin" },
    { value: "member", text: "Member" },
    { value: "manager", text: "Manager" },
  ];

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

  const RoleColumn = ({ role, member }) => (
    <EuiFlexItem>
      {isAdmin ? (
        <>
          <EuiSelect
            prepend={
              <EuiButtonIcon
                iconType={
                  member.role === "admin"
                    ? "user"
                    : member.role === "member"
                    ? "users"
                    : "usersRolesApp"
                }
                color={
                  member.role === "admin"
                    ? "primary"
                    : member.role === "member"
                    ? "warning"
                    : "success"
                }
              />
            }
            id={member.user.email}
            options={roleTypes}
            defaultValue={role}
            onChange={(value) => onChange(value, member.id)}
            value={teamRole?.find((value) => value.id === member.id)?.role || role}
            append={
              <EuiToolTip content="Are you sure you want to change?">
                <>
                  {teamRole !== undefined &&
                    teamRole
                      ?.filter((value) => value.id === member.id && value.role !== member.role)
                      .map((mem, idx) => (
                        <UpdateMemberModal
                          key={idx}
                          selectMemberId={member?.id}
                          changed_role={mem.role}
                        />
                      ))}
                </>
              </EuiToolTip>
            }
          />
        </>
      ) : (
        <EuiBadge
          iconType={
            member.role === "admin" ? "user" : member.role === "member" ? "users" : "usersRolesApp"
          }
          color={member.role === "admin" ? "default" : ""}
        >
          {member.role}
        </EuiBadge>
      )}
    </EuiFlexItem>
  );

  const columns: Array<EuiBasicTableColumn<MembersType>> = [
    {
      field: "user.email",
      name: "Username & Email",
      width: "23%",
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
                  </strong>{" "}
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
      field: "",
      width: `${isAdmin ? "6%" : "0%"}`,
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

  if (isProfileLoading || isMembersLoading) return <div>Loading...</div>;

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
