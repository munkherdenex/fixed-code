import { EuiAvatar, EuiBadge, EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiSelect, EuiSpacer, EuiText, EuiToolTip } from "@elastic/eui";
import useGetCurrentTeamMembers from "../../hooks/useCurrentTeamMembers";
import moment from "moment";
import useProfile from "../../hooks/useProfile";
import { useState } from "react";
import DeleteMemberModal from "./delete_member_modal";
import UpdateMemberModal from "./update_member_modal";

const MembersComponent = () => {
    const { team_members } = useGetCurrentTeamMembers();
    const { data: user } = useProfile();
    const isAdmin =
        team_members?.members?.filter((member) => {
            return member?.user?.email === user.email;
        })?.[0]?.role === "admin" || false;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectMemberId, setSelectedMemberId] = useState();
    const [teamRole, setTeamRole] = useState(team_members?.members);
    const roleTypes = [
        { value: 'admin', text: 'Admin' },
        { value: 'member', text: 'Member' },
    ];
    const onChange = (e, member) => {
        setTeamRole(team_members?.members?.map(value => {
            if (value.user.email === member?.user?.email) {
                return {
                    ...value,
                    role: e.target.value,
                }
            }
            return value;
        }));
    }

    return (
        <>
            {team_members?.members &&
                team_members?.members.map((member, idx) => (
                    <>
                        <EuiHorizontalRule margin="s" />
                        <EuiSpacer size="xs" />
                        <EuiFlexGroup
                            key={member.user_id}
                            gutterSize="s"
                            alignItems="center"
                            justifyContent="spaceBetween"
                        >
                            <EuiFlexItem grow={false}>
                                <EuiAvatar size="m" name={member.role} />
                            </EuiFlexItem>
                            <EuiFlexItem>
                                <EuiFlexGroup direction="column" gutterSize="none">
                                    <EuiFlexItem grow={false}>
                                        <EuiText size="s"><strong>{member.user.lname} {member.user.fname}</strong> </EuiText>
                                    </EuiFlexItem>
                                    <EuiFlexItem grow={false}>
                                        <EuiText size="xs">{member.user.email}</EuiText>
                                    </EuiFlexItem>
                                </EuiFlexGroup>
                            </EuiFlexItem>

                            <EuiFlexItem >
                                {
                                    isAdmin ? (
                                        <>
                                            <EuiSelect
                                                prepend={
                                                    <EuiButtonIcon iconType={
                                                        (member.role === 'admin') ? "user" : "users"
                                                    } color={
                                                        (member.role === 'admin') ? "primary" : "warning"
                                                    } />
                                                }
                                                id={member.user.email}
                                                options={roleTypes}
                                                defaultValue={roleTypes.filter((option) => option.value === member.role)[0].value}
                                                value={teamRole !== undefined ? teamRole[idx]?.role : roleTypes.filter((option) => option.value === member.role)[0].value}
                                                onChange={(value) => onChange(value, member)}
                                                append={
                                                    <EuiToolTip content="Are you sure you want to change?">
                                                        <>
                                                            {
                                                                (teamRole !== undefined && teamRole[idx]?.role !== member.role) &&
                                                                <UpdateMemberModal selectMemberId={member?.id} changed_role={teamRole[idx]?.role} />
                                                            }
                                                        </>
                                                    </EuiToolTip>
                                                }
                                            />
                                        </>
                                    ) : (
                                        <div>
                                            <EuiBadge iconType={
                                                (member.role === 'admin') ? "user" : "users"
                                            } color={
                                                (member.role === 'admin') ? 'default' : ''
                                            }>{member.role}</EuiBadge>

                                        </div>
                                    )
                                }

                            </EuiFlexItem>
                            <EuiFlexItem grow={false}></EuiFlexItem>
                            <EuiFlexItem grow={false}></EuiFlexItem>
                            <EuiFlexItem grow={false}></EuiFlexItem>
                            <EuiFlexItem grow={false}></EuiFlexItem>
                            <EuiFlexItem >
                                {moment(member.joined_date).format('YYYY-MM-DD hh:mm:ss')}
                            </EuiFlexItem>
                            <EuiFlexItem >
                                <div><EuiBadge iconType={
                                    (member.status === 'active') ? 'check' : (
                                        member.status === 'pending' ? 'refresh' : (
                                            ''
                                        )
                                    )
                                }
                                    color={
                                        (member.status === 'active') ? 'success' : (
                                            member.status === 'pending' ? 'warning' : (
                                                'white'
                                            )
                                        )
                                    }>{member.status}</EuiBadge></div>
                            </EuiFlexItem>
                            {
                                isAdmin && (
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

                                )
                            }
                        </EuiFlexGroup>
                    </>
                ))}
            {isModalVisible && <DeleteMemberModal selectMember={selectMemberId} setIsModalVisible={setIsModalVisible} />}
        </>
    );
};


export default MembersComponent;