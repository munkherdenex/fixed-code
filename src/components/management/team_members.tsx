import {
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormControlLayout,
  EuiFormRow,
} from "@elastic/eui";
import { Fragment, useContext } from "react";
import useGetCurrentTeamMembers from "../../hooks/useCurrentTeamMembers";
import { teamsContext } from "../../store/teams_store";
import useInviteMember from "../../hooks/useInviteMember";
import { addToast } from "../toast";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useProfile from "../../hooks/useProfile";
import MembersTable from "./members";
import { TeamMembersType } from "../../constants/members.types";

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
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });
  const { currentTeam } = useContext(teamsContext);
  const { trigger, isMutating } = useInviteMember(currentTeam?.id);
  const { mutate, data } = useGetCurrentTeamMembers<TeamMembersType>();
  const { data: user } = useProfile();
  const isAdmin =
    data?.members?.filter((member) => {
      return member?.user?.email === user.email;
    })?.[0]?.role === "admin" || false;

  const onSubmit = async (data: FormData) => {
    try {
      const response = await trigger(data);
      if (response) {
        addToast({
          id: "invite-member",
          color: "success",
          title: "Success",
          text: "Successfully invited",
        });
        reset({
          user_email: "",
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
        {isAdmin && (
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
                        <EuiFormControlLayout
                          append={
                            <EuiButton type="submit" fill isLoading={isMutating}>
                              Invite
                            </EuiButton>
                          }
                        >
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
        )}
        <EuiFlexItem grow={false}>
          <MembersTable />
        </EuiFlexItem>
      </EuiFlexGroup>
    </Fragment>
  );
};

export default TeamMembersComponent;
