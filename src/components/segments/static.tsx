import { EuiButton, EuiFieldText, EuiForm, EuiFormRow } from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { teamsContext } from "../../store/teams_store";

const schema = yup.object({
  team_id: yup.string().required(),
});

const Static = ({
  createSegment,
  isCreateSegmentMutating,
}: {
  createSegment: (data: any) => void;
  isCreateSegmentMutating: boolean;
}) => {
  const { currentTeam } = useContext(teamsContext);
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      team_id: currentTeam?.id.toString(),
    },
  });

  return (
    <>
      <EuiForm component="form" onSubmit={handleSubmit(createSegment)}>
        <EuiFormRow
          label="Team id"
          isInvalid={!!errors.team_id?.message}
          error={[errors.team_id?.message]}
        >
          <Controller
            control={control}
            name="team_id"
            render={({ field: { onChange, onBlur, value } }) => (
              <EuiFieldText
                onChange={onChange}
                value={value}
                onBlur={onBlur}
                isInvalid={!!errors.team_id?.message}
                placeholder="team_id"
                aria-label="team_id"
                disabled
                readOnly
              />
            )}
          />
        </EuiFormRow>
        <EuiFormRow>
          <EuiButton type="submit" isLoading={isCreateSegmentMutating}>
            Create Segment
          </EuiButton>
        </EuiFormRow>
      </EuiForm>
    </>
  );
};

export default Static;
