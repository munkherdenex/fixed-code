import {
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiSelect,
  EuiText,
  EuiTextArea,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { useContext, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import useCreateTeam from "../../../../../../hooks/useCreateTeam";
import useGetTeamsMyprofile, {
  TeamsMyProfileResponse,
} from "../../../../../../hooks/useGetTeamsMyprofile";
import { teamsContext } from "../../../../../../store/teams_store";
import { globalMutate } from "../../../../../../utils/globalMutate";

const schema = yup
  .object({
    parent_id: yup.string().notRequired(),
    name: yup.string().min(5).max(25).required().label("Name"),
    description: yup.string().notRequired().label("Description"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const TeamCreate = ({ id }: { id: string }) => {
  const router = useRouter();
  const { teams } = useContext(teamsContext);
  const { data: myProfile } = useGetTeamsMyprofile<TeamsMyProfileResponse | null>(id);
  const { isMutating, trigger } = useCreateTeam<FormData>();

  const teamOptions = useMemo(
    () =>
      Array.isArray(teams) && teams.length > 0
        ? [
            { value: "", text: "Select parent team" },
            ...teams
              .filter((team) => !team.parent_id)
              .map((team) => ({
                value: team.id,
                text: team.name,
              })),
          ]
        : [],
    [teams],
  );

  const selectedTeam = useMemo(
    () => teams?.find((team) => team?.id.toString() === id),
    [teams, id],
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      parent_id: id.toString(),
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await trigger(data);
      if (response) {
        await router.push("/dashboards/settings/management");
        globalMutate("/api/v1/teams");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (myProfile?.role !== "admin") {
    return <div>Only admins can create teams</div>;
  }

  if (!selectedTeam) {
    return <div>Team not found</div>;
  }

  return (
    <EuiFlexGroup alignItems="center" justifyContent="center" direction="column">
      <EuiFlexItem grow={false}>
        <EuiText>
          <h1>What should we call your team?</h1>
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiText>
          <p>You can always change this later from settings.</p>
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
          <EuiFormRow
            label="Parent team*"
            helpText="If you want to create a sub team, select the parent team"
            isInvalid={!!errors.parent_id?.message}
            error={[errors.parent_id?.message]}
          >
            <Controller
              name="parent_id"
              control={control}
              defaultValue=""
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiSelect
                  disabled
                  onChange={onChange}
                  value={value}
                  options={teamOptions}
                  onBlur={onBlur}
                  isInvalid={!!errors.parent_id?.message}
                  aria-label="channel type"
                  hasNoInitialSelection
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow
            label="Team name"
            isInvalid={!!errors.name?.message}
            error={[errors.name?.message]}
          >
            <Controller
              name="name"
              control={control}
              defaultValue=""
              render={({ field: { onChange, value, onBlur }, formState: { errors } }) => (
                <EuiFieldText
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  placeholder="Enter team name"
                  aria-label="Enter team name"
                  isInvalid={!!errors.name?.message}
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow
            label="Team description"
            isInvalid={!!errors.description?.message}
            error={[errors.description?.message]}
          >
            <Controller
              name="description"
              control={control}
              defaultValue=""
              render={({ field: { onChange, value, onBlur }, formState: { errors } }) => (
                <EuiTextArea
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  placeholder="Enter team description"
                  aria-label="Enter team description"
                  isInvalid={!!errors.description?.message}
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow>
            <EuiButton isLoading={isMutating} disabled={isMutating} type="submit" fullWidth fill>
              Create Team
            </EuiButton>
          </EuiFormRow>
          {teamOptions?.length > 0 ? (
            <EuiFormRow>
              <EuiButton
                color="danger"
                onClick={() => router.back()}
                type="button"
                size="s"
                fullWidth
                fill
              >
                Cancel
              </EuiButton>
            </EuiFormRow>
          ) : null}
        </EuiForm>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export const getServerSideProps = async (context: { query: any }) => {
  const query = context.query;
  if (query?.id) {
    return {
      props: {
        id: query.id,
      },
    };
  }
};

export default TeamCreate;
