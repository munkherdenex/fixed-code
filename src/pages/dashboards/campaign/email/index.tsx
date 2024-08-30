import {
  EuiButton,
  EuiCallOut,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiIcon,
  EuiPanel,
  EuiSelect,
  EuiToolTip,
  EuiButtonIcon,
  EuiSpacer,
} from "@elastic/eui";
import Head from "next/head";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect } from "react";
import DashboardLayout from "../../../../layouts/dashboard";
import * as yup from "yup";
import { IS_POCKET } from "../../../../constants";
import { quillEditorStyles } from "../../../../components/email_editor/quill_editor.styles";
import useCreateTemplate from "../../../../hooks/useCreateTemplate";
import useGetChannels, { Channels } from "../../../../hooks/useGetChannels";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { globalMutate } from "../../../../utils/globalMutate";
import QuillEditorComponent from "../../../../components/email_editor/quill_editor";
import JumpToCreateChannelButton from "../../../../components/campaign/jump_to_create_channel_button";
import { addToast } from "../../../../components/toast";
const bodyHelpText = "Use custom attributes to make data dynamic. {{cf_*}}";

const BodyInfoToolTip = () => {
  return (
    <EuiToolTip
      position="bottom"
      content="You need to define the custom fields you plan to use. Common custom fields might include {{email}}, {{phone}}, {{cf_company_name}}, {{cf_email}}, etc."
    >
      <EuiIcon tabIndex={0} type="questionInCircle" title="Icon with tooltip" />
    </EuiToolTip>
  );
};

const schema = yup
  .object({
    title: yup.string().required().label("Title"),
    kind: yup.string().oneOf(["email", "sms", "push", "inapp", "api", ""]).required().label("Data"),
    body: yup
      .string()
      .required()
      .label("Body")
      .when(["kind"], ([kind], schema) => {
        if (kind === "sms" || kind === "push") return schema.max(160, "Max 160 characters");
        return schema;
      }),
    channel: yup.number().required().label("Channel"),
  })
  .required();

const dataTypeOptions = [
  { value: "email", text: "Email" },
  { value: "sms", text: "Sms" },
  { value: "push", text: "Push" },
  { value: "inapp", text: "Inapp" },
  { value: "api", text: "Api" },
];

type FormData = yup.InferType<typeof schema>;

export const dataTypeSwitch = (dataType: FormData["kind"]): FormData["kind"] => {
  if (!IS_POCKET) return dataType;
  //TODO: If team is not pocket return just kind
  switch (dataType) {
    case "sms":
      return "api";
    case "email":
      return "api";
    case "push":
      return "api";
    default:
      return dataType;
  }
};

export const dataTypeToSwitch = (dataType: string) => {
  if (!IS_POCKET) return dataType;
  switch (dataType) {
    case "sms":
      return "phone";
    case "email":
      return "email";
    case "push":
      return "device_id";
    default:
      return dataType;
  }
};

const pathPrefix = process.env.PATH_PREFIX;

const Dashboard: FunctionComponent = () => {
  const styles = quillEditorStyles();
  const router = useRouter();
  const { isMutating, trigger } = useCreateTemplate();

  const { data: channelsData } = useGetChannels<Channels[]>(undefined, {
    all: `${true}`,
  });

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
    defaultValues: {
      kind: "email",
    },
  });

  const channelDataOptions = Array.isArray(channelsData)
    ? channelsData
        .filter((channel) => channel.channel_type === dataTypeSwitch("email"))
        .map((channel) => ({
          value: channel.id,
          text: channel.name,
        }))
    : [];

  const setReactQuill = (value: string) => {
    setValue("body", value);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const preparedData = {
        ...data,
      };
      if (IS_POCKET) {
        preparedData.kind = "api";
        preparedData.body = JSON.stringify({
          type: "email",
          to: `{{${dataTypeToSwitch(data.kind)}}}`,
          title: data.title,
          body: data.body,
        });
      }
      const response = await trigger(preparedData);
      if (response) {
        globalMutate("/api/v1/dj/templates/");
        router.push("/dashboards/campaign");
        addToast({
          id: "success",
          title: "Successfully created",
          color: "success",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Head>
        <title>Create email campaign</title>
      </Head>
      <DashboardLayout
        pageHeader={{
          pageTitle: "Create email campaign",
          iconType: "dashboardApp",
        }}
      >
        <>
          <EuiPanel>
            <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
              <EuiFlexGroup justifyContent="spaceBetween">
                <EuiFlexItem grow={false}>
                  <EuiButtonIcon
                    display="base"
                    iconType="arrowLeft"
                    aria-label="back"
                    color="text"
                    size="s"
                    onClick={() => router.replace(`${pathPrefix}/dashboards/campaign`)}
                  />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton isLoading={isMutating} type="submit">
                    Create campaign
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiSpacer size="xl" />
              {channelDataOptions.length === 0 && (
                <EuiFormRow>
                  <EuiCallOut title="Proceed with caution!" color="warning" iconType="warning">
                    <p>You need to create a channel before you can create a campaign.</p>
                    <EuiButton
                      onClick={() =>
                        router.push("/dashboards/channels", {
                          query: {
                            create: true,
                          },
                        })
                      }
                    >
                      Create
                    </EuiButton>
                  </EuiCallOut>
                </EuiFormRow>
              )}
              <EuiSpacer size="s" />
              <EuiFlexGroup>
                <EuiFlexItem grow={false}>
                  <EuiFormRow
                    label="Title"
                    isInvalid={!!errors.title?.message}
                    error={[errors.title?.message]}
                  >
                    <Controller
                      control={control}
                      name="title"
                      render={({ field: { onChange, onBlur, value }, formState: { errors } }) => (
                        <EuiFieldText
                          onChange={onChange}
                          value={value}
                          onBlur={onBlur}
                          isInvalid={!!errors.title?.message}
                          placeholder="Title"
                          aria-label="Title"
                        />
                      )}
                    />
                  </EuiFormRow>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFormRow
                    label="Channel"
                    isInvalid={!!errors.channel?.message}
                    error={[errors.channel?.message]}
                  >
                    <EuiFlexGroup alignItems="center">
                      <EuiFlexItem
                        style={
                          channelDataOptions.length === 0
                            ? {
                                display: "none",
                              }
                            : {}
                        }
                      >
                        <Controller
                          control={control}
                          name="channel"
                          render={({
                            field: { onChange, onBlur, value },
                            formState: { errors },
                          }) => (
                            <EuiSelect
                              onChange={onChange}
                              value={value}
                              options={channelDataOptions}
                              onBlur={onBlur}
                              isInvalid={!!errors.channel?.message}
                              aria-label="data type"
                              hasNoInitialSelection
                            />
                          )}
                        />
                      </EuiFlexItem>
                      <JumpToCreateChannelButton show={channelDataOptions.length === 0} />
                    </EuiFlexGroup>
                  </EuiFormRow>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFormRow
                    label="Data type"
                    isInvalid={!!errors.kind?.message}
                    error={[errors.kind?.message]}
                    style={{ display: "none" }}
                  >
                    <Controller
                      control={control}
                      name="kind"
                      render={({ field: { onChange, onBlur, value }, formState: { errors } }) => (
                        <EuiSelect
                          onChange={onChange}
                          value={value}
                          options={dataTypeOptions}
                          onBlur={onBlur}
                          isInvalid={!!errors.kind?.message}
                          aria-label="data type"
                        />
                      )}
                    />
                  </EuiFormRow>
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiSpacer size="s" />
              <EuiFormRow
                label="Data"
                labelAppend={<BodyInfoToolTip />}
                helpText={bodyHelpText}
                isInvalid={!!errors?.body?.message}
                error={[errors?.body?.message]}
                css={styles.quillEditorContainer}
              >
                <>
                  <QuillEditorComponent control={control} onChange={setReactQuill} />
                </>
              </EuiFormRow>
            </EuiForm>
          </EuiPanel>
        </>
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
