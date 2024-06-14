import {
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiText,
} from "@elastic/eui";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useCreateTeam from "../../../../hooks/useCreateTeam";
import { useRouter } from "next/router";
import { mutate } from "swr";

const schema = yup
  .object({
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
    resolver: yupResolver(schema),
  });
  const router = useRouter();
  const { isMutating, trigger } = useCreateTeam<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await trigger(data);
      if (response.ok) {
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
        </EuiForm>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default TeamCreate;
