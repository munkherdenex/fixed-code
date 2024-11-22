import {
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiText,
  EuiTextArea,
} from "@elastic/eui";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/router";
import useCreateTeam from "../../../../../hooks/useCreateTeam";
import { globalMutate } from "../../../../../utils/globalMutate";
import { IS_POCKET } from "../../../../../constants";

const schema = yup
  .object({
    parent_id: yup.string().notRequired(),
    name: yup.string().min(5).max(25).required().label("Name"),
    description: yup.string().notRequired().label("Description"),
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
      if (response) {
        await router.push("/dashboards/settings/management");
        globalMutate("/api/v1/teams");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!IS_POCKET) {
    return <div></div>;
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
        </EuiForm>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default TeamCreate;
