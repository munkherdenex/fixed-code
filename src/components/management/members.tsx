import { EuiAvatar, EuiBadge, EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiSpacer, EuiText } from "@elastic/eui";
import useGetCurrentTeamMembers from "../../hooks/useCurrentTeamMembers";
import moment from "moment";

const MembersComponent = () => {
    const { team_members } = useGetCurrentTeamMembers();
    return (
        <>
            {team_members?.members &&
                team_members?.members.map((member) => (
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
                                <div>
                                    <EuiBadge iconType={
                                        (member.role === 'admin') ? "user" : "users"
                                    } color={
                                        (member.role === 'admin') ? 'default' : ''
                                    }>{member.role}</EuiBadge>
                                </div>
                            </EuiFlexItem>
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
                        </EuiFlexGroup>
                    </>
                ))}
        </>
    );
};


export default MembersComponent;