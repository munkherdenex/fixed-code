import {
  EuiButton,
  EuiButtonIcon,
  EuiFieldText,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useTranslations } from "next-intl";
import * as yup from "yup";
import useInviteMember from "../../hooks/useInviteMember";
import useSearchUser from "../../hooks/useSearchUser";
import { useManagementTeamsContext } from "../../store/management_teams_store";
import { globalMutate } from "../../utils/globalMutate";
import AdminComponent from "../admin_component";

const emailSchema = yup.object({
  email: yup.string().email().required().label("Email"),
});

const schema = yup.object({
  firstName: yup.string().required().label("First name"),
  lastName: yup.string().required().label("Last name"),
});

type EmailData = yup.InferType<typeof emailSchema>;

type MyFormData = yup.InferType<typeof schema>;

const InviteUserFlyout = ({
  setIsFlyoutVisible,
}: {
  setIsFlyoutVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const translate = useTranslations();
  const { currentTeam } = useManagementTeamsContext();

  const { trigger, data } = useSearchUser();
  const { trigger: inviteTrigger, isMutating } = useInviteMember(currentTeam?.id);
  const pushedFlyoutTitleId = useGeneratedHtmlId({
    prefix: "pushedFlyoutTitle",
  });

  const {
    handleSubmit: handleSubmitEmail,
    control: controlEmail,
    getValues: getEmailValues,
    formState: { errors: errorsEmail },
  } = useForm({
    resolver: yupResolver(emailSchema),
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  });

  const onSubmitEmail = (data: EmailData) => {
    trigger({ email: data.email });
  };

  const onSubmit = async (data: MyFormData) => {
    const response = await inviteTrigger({
      user_email: getEmailValues("email"),
      fname: data.firstName,
      lname: data.lastName,
    });
    if (response) {
      setIsFlyoutVisible(false);
      if (currentTeam?.id) {
        globalMutate(`/api/v1/teams/${currentTeam?.id}/?members=true`);
      }
    }
  };

  useEffect(() => {
    if (!getValues("firstName") && !getValues("lastName")) {
      setValue("firstName", data?.fname);
      setValue("lastName", data?.lname);
    }
  }, [data?.fname, data?.lname, getValues, setValue]);

  return (
    <EuiFlyout
      size="s"
      onClose={() => setIsFlyoutVisible(false)}
      aria-labelledby={pushedFlyoutTitleId}
    >
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2 id={pushedFlyoutTitleId}>{translate("add_to_user")}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" onSubmit={handleSubmitEmail(onSubmitEmail)}>
          <EuiFormRow
            label={translate("email")}
            isInvalid={!!errorsEmail.email?.message}
            error={[errorsEmail?.email?.message]}
          >
            <Controller
              control={controlEmail}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiFieldText
                  onChange={onChange}
                  value={value}
                  onBlur={() => {
                    onBlur();
                    if (value) {
                      handleSubmitEmail(onSubmitEmail)();
                    }
                  }}
                  placeholder="Email"
                  isInvalid={!!errorsEmail.email?.message}
                  append={
                    <EuiButtonIcon iconType={"search"} type="submit" disabled={isMutating}>
                      {translate("search")}
                    </EuiButtonIcon>
                  }
                  fullWidth
                />
              )}
            />
          </EuiFormRow>
        </EuiForm>
        <EuiSpacer size="m" />
        <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
          <EuiFormRow
            label={translate("first_name")}
            isInvalid={!!errors.firstName?.message}
            error={[errors?.firstName?.message]}
          >
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiFieldText
                  onChange={onChange}
                  value={value}
                  onBlur={onBlur}
                  placeholder="First name"
                  isInvalid={!!errors.firstName?.message}
                  disabled={!!data?.fname}
                  fullWidth
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow
            label={translate("last_name")}
            isInvalid={!!errors.lastName?.message}
            error={[errors?.lastName?.message]}
          >
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiFieldText
                  onChange={onChange}
                  value={value}
                  onBlur={onBlur}
                  placeholder="Last name"
                  isInvalid={!!errors.lastName?.message}
                  disabled={!!data?.lname}
                  fullWidth
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow>
            <EuiButton type="submit" fill disabled={isMutating} isLoading={isMutating}>
              {translate("invite_user")}
            </EuiButton>
          </EuiFormRow>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export const InviteUserFlyoutContainer = () => {
  const translate = useTranslations();
  const { isAdmin, isManager } = useManagementTeamsContext();

  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  if (isAdmin || isManager) {
    return (
      <AdminComponent>
        <>
          <EuiButton onClick={() => setIsFlyoutVisible(true)}>{translate("invite_user")}</EuiButton>
          {isFlyoutVisible && (isAdmin || isManager) && (
            <InviteUserFlyout setIsFlyoutVisible={setIsFlyoutVisible} />
          )}
        </>
      </AdminComponent>
    );
  }

  return null;
};

export default InviteUserFlyout;
