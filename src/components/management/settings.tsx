import {
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiPanel,
  EuiSwitch,
  useEuiTheme,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import useUpdateProfile from "../../hooks/useUpdateProfile";
import { authContext } from "../../store/auth_store";
import { signinFormStyles } from "../signin_form/signin_form.styles";

const schema = yup
  .object({
    fname: yup.string().required("please enter your first name address"),
    lname: yup.string().required("please enter your last name"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const Settings = () => {
  const { euiTheme } = useEuiTheme();
  const { user } = useContext(authContext);
  const styles = signinFormStyles(euiTheme);
  const { trigger, isMutating } = useUpdateProfile<FormData>();
  const [isEditProfile, setIsEditProfile] = useState(false);

  const onChange = (e) => {
    setIsEditProfile(e.target.checked);
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fname: user?.fname,
      lname: user?.lname,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await trigger(data);
      if (response) {
        setIsEditProfile(false);
      } else {
        alert(response?.status);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <EuiFlexGroup responsive={false} css={styles.container} direction="column">
      <EuiFlexItem>
        <EuiSwitch label="Edit profile" checked={isEditProfile} onChange={(e) => onChange(e)} />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiPanel>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiForm
                component="form"
                css={styles.form.container}
                onSubmit={handleSubmit(onSubmit)}
              >
                <EuiFormRow
                  label="First name"
                  isInvalid={!!errors.fname?.message}
                  error={[errors.fname?.message]}
                >
                  <Controller
                    control={control}
                    name="fname"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <EuiFieldText
                        onChange={onChange}
                        value={value}
                        onBlur={onBlur}
                        isInvalid={!!errors.fname?.message}
                        readOnly={!isEditProfile}
                        placeholder="First name"
                        aria-label="first name"
                      />
                    )}
                  />
                </EuiFormRow>
                <EuiFormRow
                  label="Last name"
                  isInvalid={!!errors.lname?.message}
                  error={[errors.lname?.message]}
                >
                  <Controller
                    control={control}
                    name="lname"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <EuiFieldText
                        onChange={onChange}
                        value={value}
                        onBlur={onBlur}
                        isInvalid={!!errors.lname?.message}
                        readOnly={!isEditProfile}
                        placeholder="Last name"
                        aria-label="Last name"
                      />
                    )}
                  />
                </EuiFormRow>
                {isEditProfile && (
                  <EuiButton isLoading={isMutating} disabled={isMutating} type="submit">
                    Update
                  </EuiButton>
                )}
              </EuiForm>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default Settings;
