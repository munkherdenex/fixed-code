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
import { MembersType } from "../../constants/members.types";
import useGetCurrentTeamMembers from "../../hooks/useCurrentTeamMembers";
import useProfile from "../../hooks/useProfile";
import DeleteMemberModal from "./delete_member_modal";
import UpdateMemberModal from "./update_member_modal";

const MembersTable = () => {
    const { team_members } = useGetCurrentTeamMembers();
    const { data: user } = useProfile();

    const isAdmin =
        team_members?.members?.some(
            (member) => member?.user?.email === user.email && member?.role === "admin",
        ) || false;

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectMemberId, setSelectedMemberId] = useState<any>();
    const [teamRole, setTeamRole] = useState(team_members?.members);

    const roleTypes = [
        { value: "admin", text: "Admin" },
        { value: "member", text: "Member" },
    ];

    const onChange = (e, id) => {
        setTeamRole(
            team_members?.members?.map((value) => {
                if (value.id === id) {
                    return {
                        ...value,
                        role: e.target.value,
                    };
                }
                return {
                    ...value
                };
            }),
        );
    };

    const columns: Array<EuiBasicTableColumn<MembersType>> = [
        {
            field: "user.email",
            name: "Email",
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
            render: (role: MembersType["role"], member: MembersType,) => {
                return <EuiFlexItem>
                    {isAdmin ? (
                        <>
                            <EuiSelect
                                prepend={
                                    <EuiButtonIcon
                                        iconType={member.role === "admin" ? "user" : "users"}
                                        color={member.role === "admin" ? "primary" : "warning"}
                                    />
                                }
                                id={member.user.email}
                                options={roleTypes}
                                defaultValue={role}
                                onChange={(value) => onChange(value, member.id)}
                                value={teamRole !== undefined ?
                                    teamRole.filter(value => {
                                        return value?.id === member.id
                                    }).map(mem => {
                                        if (mem.role !== member.role) {
                                            return mem.role;
                                        }
                                        return roleTypes.filter((option) => option.value === role)[0].value
                                    })
                                    : roleTypes.filter((option) => option.value === role)[0].value}
                                append={
                                    <EuiToolTip content="Are you sure you want to change?">
                                        <>
                                            {teamRole !== undefined && teamRole.filter(value => {
                                                return value?.id === member.id
                                            }).map(mem => {
                                                if (mem.role !== member.role) {
                                                    return (
                                                        <UpdateMemberModal selectMemberId={member?.id} changed_role={mem.role} />
                                                    )
                                                }
                                            })}
                                        </>
                                    </EuiToolTip>
                                }
                            />
                        </>
                    ) : (
                        <div>
                            <EuiBadge
                                iconType={member.role === "admin" ? "user" : "users"}
                                color={member.role === "admin" ? "default" : ""}
                            >
                                {member.role}
                            </EuiBadge>
                        </div>
                    )}
                </EuiFlexItem>
            },
        },
        {
            name: "Joined Date",
            field: "joined_date",
            render: (joined_date: MembersType["joined_date"]) => (
                <EuiFlexItem>{moment(joined_date).format("YYYY-MM-DD hh:mm:ss")}</EuiFlexItem>
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
            name: "Action",
            field: "",
            hidden: !isAdmin,
            render: (member: MembersType) => (
                <EuiButtonIcon
                    display="base"
                    iconType="trash"
                    aria-label="Delete"
                    color="danger"
                    onClick={() => {
                        setSelectedMemberId(member?.id);
                        setIsModalVisible(true);
                    }}
                />
            ),
        },
    ];

    return (
        <>
            {isModalVisible && (
                <DeleteMemberModal selectMember={selectMemberId} setIsModalVisible={setIsModalVisible} />
            )}
            <EuiPanel>
                <EuiBasicTable
                    tableCaption="Demo of EuiBasicTable"
                    itemId="id"
                    items={team_members?.members || []}
                    rowHeader="firstName"
                    columns={columns}
                />
            </EuiPanel>
        </>
    );
};

export default MembersTable;
