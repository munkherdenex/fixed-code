import {
  EuiButton,
  EuiFieldPassword,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiPanel,
  useEuiTheme,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { authContext } from "../../store/auth_store";
import { signinFormStyles } from "../signin_form/signin_form.styles";
import { addToast } from "../toast";
import useChangePassword from "../../hooks/useChangePassword";
import { teamsContext } from "../../store/teams_store";

const schema = yup
  .object({
    current_password: yup.string().required("please enter old password"),
    new_password: yup
      .string()
      .min(8)
      .matches(/[0-9]/, "Password requires a number")
      .matches(/[a-z]/, "Password requires a lowercase letter")
      .matches(/[A-Z]/, "Password requires an uppercase letter")
      .matches(/[^\w]/, "Password requires a symbol")
      .required("please enter your password"),
    new_password_repeat: yup.string().required("please enter old password"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const SecurityComponent = () => {
  const { euiTheme } = useEuiTheme();
  const styles = signinFormStyles(euiTheme);
  const { trigger, isMutating } = useChangePassword<FormData>();
  const { removeUserTokenData, user } = useContext(authContext);
  const { clearCurrentTeam } = useContext(teamsContext);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await trigger(data);
      if (response) {
        addToast({
          id: "change-password",
          color: "success",
          title: "Success",
          text: "Successfully changed",
        });
        removeUserTokenData();
        clearCurrentTeam();
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <EuiFlexGroup css={styles.container} direction="column">
      <EuiFlexItem>
        <EuiPanel>
          <EuiForm component="form" css={styles.form.container} onSubmit={handleSubmit(onSubmit)}>
            <EuiFormRow
              label="Password"
              isInvalid={!!errors.current_password?.message}
              error={[errors.current_password?.message]}
            >
              <Controller
                control={control}
                name="current_password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <EuiFieldPassword
                    onChange={onChange}
                    value={value}
                    onBlur={onBlur}
                    isInvalid={!!errors.current_password?.message}
                    type={"dual"}
                    placeholder="Old password"
                    aria-label="current_password"
                  />
                )}
              />
            </EuiFormRow>
            <EuiFormRow
              label="Password"
              isInvalid={!!errors.new_password?.message}
              error={[errors.new_password?.message]}
            >
              <Controller
                control={control}
                name="new_password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <EuiFieldPassword
                    onChange={onChange}
                    value={value}
                    onBlur={onBlur}
                    isInvalid={!!errors.new_password?.message}
                    type={"dual"}
                    placeholder="New password"
                    aria-label="new_password"
                  />
                )}
              />
            </EuiFormRow>
            <EuiFormRow
              label="Password"
              isInvalid={!!errors.new_password_repeat?.message}
              error={[errors.new_password_repeat?.message]}
            >
              <Controller
                control={control}
                name="new_password_repeat"
                render={({ field: { onChange, onBlur, value } }) => (
                  <EuiFieldPassword
                    onChange={onChange}
                    value={value}
                    onBlur={onBlur}
                    isInvalid={!!errors.new_password_repeat?.message}
                    type={"dual"}
                    placeholder="Repeat password"
                    aria-label="new_password_repeat"
                  />
                )}
              />
            </EuiFormRow>
            <EuiButton isLoading={isMutating} type="submit" fill>
              Change password
            </EuiButton>
          </EuiForm>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default SecurityComponent;
