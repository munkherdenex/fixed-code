import {
  EuiAvatar,
  EuiBadge,
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormControlLayout,
  EuiFormRow,
  EuiHorizontalRule,
  EuiPopover,
  EuiSpacer,
  EuiText,
} from "@elastic/eui";
import { Fragment, useContext, useState } from "react";
import useGetCurrentTeamMembers from "../../hooks/useCurrentTeamMembers";
import { teamsContext } from "../../store/teams_store";
import useInviteMember from "../../hooks/useInviteMember";
import { addToast } from "../toast";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import moment from "moment";

const MembersPopover = ({ member }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const onButtonClick = () => setIsPopoverOpen((isPopoverOpen1) => !isPopoverOpen1);
  const closePopover = () => setIsPopoverOpen(false);

  return (
    <EuiPopover
      id={member?.id?.toString()}
      key={member?.id}
      panelPaddingSize="s"
      button={
        <EuiButton size="s" onClick={onButtonClick}>
          edit
        </EuiButton>
      }
      isOpen={isPopoverOpen}
      closePopover={closePopover}
    >
      <EuiText size="s" style={{ width: 300 }}>
        <p>Actions</p>
      </EuiText>
    </EuiPopover>
  );
};

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
              {/* <EuiFlexItem grow={false}>
                <MembersPopover member={member} />
              </EuiFlexItem> */}
            </EuiFlexGroup>
          </>
        ))}
    </>
  );
};

const schema = yup
  .object({
    user_email: yup.string().email().required("please enter your email address"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;
const TeamMembersComponent = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
  });
  const { currentTeam } = useContext(teamsContext);
  const { trigger } = useInviteMember(currentTeam?.id);
  const { mutate } = useGetCurrentTeamMembers();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await trigger(data);
      console.log(response);
      if (response.ok) {
        addToast({
          id: "invite-member",
          color: "success",
          title: "Success",
          text: "Successfully invited",
        });
        reset({
          user_email: ""
        });
        if (currentTeam?.id) {
          mutate(`/api/v1/teams/${currentTeam?.id}/?members=true`);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Fragment>
      <EuiFlexGroup direction="column">
        <EuiFlexItem grow={false}>
          <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
            <EuiFlexGroup direction="column">
              <EuiFlexItem>
                <EuiFormRow
                  isInvalid={!!errors.user_email?.message}
                  error={[errors.user_email?.message]}
                >
                  <Controller
                    control={control}
                    name="user_email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <EuiFormControlLayout append={<EuiButton type="submit" fill>Invite</EuiButton>}>
                        <EuiFieldText
                          name="user_email"
                          onChange={onChange}
                          value={value}
                          onBlur={onBlur}
                          isInvalid={!!errors.user_email?.message}
                          placeholder="Email address"
                          aria-label="user_email"
                          type="text"
                          controlOnly
                        />
                      </EuiFormControlLayout>
                    )}
                  />
                </EuiFormRow>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiForm>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <MembersComponent />
        </EuiFlexItem>
      </EuiFlexGroup>
    </Fragment>
  );
};

export default TeamMembersComponent;
