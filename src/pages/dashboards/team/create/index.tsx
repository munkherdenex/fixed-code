import {
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiSelect,
  EuiText,
} from "@elastic/eui";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useCreateTeam from "../../../../hooks/useCreateTeam";
import { useRouter } from "next/router";
import { mutate } from "swr";
import { useContext } from "react";
import { teamsContext } from "../../../../store/teams_store";

const schema = yup
  .object({
    parent_id: yup.string().notRequired(),
    name: yup.string().min(5).required(),
    description: yup.string().required(),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const TeamCreate = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
  });
  const router = useRouter();
  const { teams } = useContext(teamsContext);
  const { isMutating, trigger } = useCreateTeam<FormData>();

  const teamOptions = Array.isArray(teams)
    ? [
        { value: "", text: "" },
        ...teams
          .filter((team) => !team.parent_id)
          .map((team) => ({
            value: team.id,
            text: team.name,
          })),
      ]
    : [{ value: "", text: "" }];

  const onSubmit = async (data: FormData) => {
    try {
      const response = await trigger(data);
      if (response) {
        await mutate("/api/v1/teams");
        router.push("/dashboards/");
      }
    } catch (error) {
      console.error(error);
    }
  };

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
              render={({ field }) => (
                <EuiFieldText
                  {...field}
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
              render={({ field }) => (
                <EuiFieldText
                  {...field}
                  placeholder="Enter team description"
                  aria-label="Enter team description"
                  isInvalid={!!errors.description?.message}
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow>
            <EuiButton isLoading={isMutating} type="submit" fullWidth fill>
              Create Team
            </EuiButton>
          </EuiFormRow>
          <EuiFormRow>
            <EuiButton
              color="danger"
              onClick={() => router.push("/dashboards")}
              type="button"
              size="s"
              fullWidth
              fill
            >
              Cancel
            </EuiButton>
          </EuiFormRow>
        </EuiForm>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default TeamCreate;
