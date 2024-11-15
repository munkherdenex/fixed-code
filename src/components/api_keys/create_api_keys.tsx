import {
  useGeneratedHtmlId,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiTitle,
  EuiFlyoutBody,
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiButton,
  EuiDatePicker,
  EuiSelect,
} from "@elastic/eui";
import { SetStateAction, useContext } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { addToast } from "../toast";
import useCreateAPIKeys from "../../hooks/useCreateAPIKeys";
import AceEditorComponent from "../campaign/ace_editor";
import moment from "moment";
import useTeamID from "../../hooks/useTeamID";
import { teamsContext } from "../../store/teams_store";

const schema = yup
  .object({
    name: yup.string().required("please enter api key name"),
    team_id: yup.string().notRequired(),
    data: yup.string().notRequired(),
    expires_at: yup.date().notRequired(),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

export interface ApiKeyResponseDataType {
  name?: string;
  kid?: string;
  secret?: string;
}

const CreateAPIKeysComponent = ({
  setIsFlyoutVisible,
  setIsModalVisible,
  setResponseData,
}: {
  setIsFlyoutVisible: React.Dispatch<SetStateAction<boolean>>;
  setIsModalVisible: React.Dispatch<SetStateAction<boolean>>;
  setResponseData: React.Dispatch<SetStateAction<ApiKeyResponseDataType>>;
}) => {
  const flyoutHeadingId = useGeneratedHtmlId();
  const { trigger, isMutating } = useCreateAPIKeys();
  const { teams } = useContext(teamsContext);

  const dataTypeOptions = teams?.map((team) => {
    return {
      value: team?.id,
      text: `${team?.name}`,
    };
  }) || [{ value: "", text: "" }];
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      team_id: teams?.[0]?.id.toString() || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await trigger(data);
      if (response) {
        setIsFlyoutVisible(false);
        setResponseData(response);
        setIsModalVisible(true);
        addToast({
          id: "api-keys-success",
          color: "success",
          title: "Success",
          text: "Successfully created",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const setAceEditorValue = (value: string) => {
    setValue("data", value);
  };

  return (
    <>
      <EuiFlyout onClose={() => setIsFlyoutVisible(false)}>
        <EuiFlyoutHeader hasBorder aria-labelledby={flyoutHeadingId}>
          <EuiTitle>
            <h2 id={flyoutHeadingId}>Create API KEY</h2>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
            <EuiFormRow
              label="Name"
              isInvalid={!!errors.name?.message}
              error={[errors.name?.message]}
            >
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <EuiFieldText
                    onChange={onChange}
                    value={value}
                    onBlur={onBlur}
                    isInvalid={!!errors.name?.message}
                    placeholder="Name"
                    aria-label="name"
                  />
                )}
              />
            </EuiFormRow>
            <EuiFormRow
              label="Team name"
              isInvalid={!!errors.team_id?.message}
              error={[errors.team_id?.message]}
            >
              <Controller
                control={control}
                name="team_id"
                render={({ field: { onChange, onBlur, value } }) => (
                  <EuiSelect
                    onChange={onChange}
                    value={value}
                    options={dataTypeOptions}
                    onBlur={onBlur}
                    isInvalid={!!errors.team_id?.message}
                    aria-label="Team id"
                  />
                )}
              />
            </EuiFormRow>

            <EuiFormRow
              label="Expiry date"
              isInvalid={!!errors.expires_at?.message}
              error={[errors.expires_at?.message]}
            >
              <Controller
                control={control}
                name="expires_at"
                render={({ field: { onChange, onBlur, value } }) => (
                  <EuiDatePicker
                    showTimeSelect
                    selected={value ? moment(value) : null}
                    onBlur={onBlur}
                    onChange={onChange}
                    placeholder="Expiry date"
                    isInvalid={!!errors.expires_at?.message}
                  />
                )}
              />
            </EuiFormRow>
            <EuiFormRow
              label="Data"
              helpText="*Optional"
              isInvalid={!!errors?.data?.message}
              error={[errors?.data?.message]}
            >
              <AceEditorComponent control={control} onChange={setAceEditorValue} />
            </EuiFormRow>
            <EuiFormRow hasEmptyLabelSpace>
              <EuiButton isLoading={isMutating} disabled={isMutating} type="submit">
                Create API KEY
              </EuiButton>
            </EuiFormRow>
          </EuiForm>
        </EuiFlyoutBody>
      </EuiFlyout>
    </>
  );
};

export default CreateAPIKeysComponent;
