import {
  EuiButton,
  EuiButtonIcon,
  EuiCodeBlock,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  EuiTextArea,
  EuiToolTip,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { jsonrepair } from "jsonrepair";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { IS_POCKET } from "../../constants";
import useUpdateTemplate from "../../hooks/useUpdateTemplate";
import { useCampaignContext } from "../../store/campaign_store";
import { globalMutate } from "../../utils/globalMutate";
import { dataTypeToSwitch, getDataKind, processBody, processKind } from "../../utils/helper";
import { isJson } from "../../utils/is_json";
import AceEditorComponent from "./ace_editor";

const schema = yup
  .object({
    title: yup.string().required().label("Title"),
    kind: yup.string().oneOf(["email", "sms", "push", "inapp", "api"]).required().label("Data"),
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

type FormData = yup.InferType<typeof schema>;

const GeneralDetails = () => {
  const { data, isLoading } = useCampaignContext();

  const { isMutating, trigger } = useUpdateTemplate(data?.id?.toString());
  const [isView, setIsView] = useState(true);

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      kind: processKind(data?.body, data?.kind),
      body: processBody(data?.body, processKind(data?.body, data?.kind)),
      title: data?.title,
      channel: data?.channel,
    },
  });

  const dataKind = getDataKind(data);

  const setView = () => {
    setIsView((prev) => !prev);
  };

  const setAceEditorValue = (value: string) => {
    setValue("body", value);
  };

  const onSubmit = async (data: FormData) => {
    if (!isJson(watch("body")) && watch("kind") === "api") {
      setError("body", {
        message: "Invalid json",
        type: "manual",
      });
      return;
    }
    try {
      const preparedData = {
        ...data,
      };

      const dataType = processKind(data?.body, data?.kind);

      if ((dataType === "sms" || dataType === "push") && IS_POCKET) {
        preparedData.kind = "api";
        preparedData.body = JSON.stringify({
          type: dataType,
          to: `{{${dataTypeToSwitch(data?.kind)}}}`,
          title: data?.title,
          body: data?.body,
        });
      }

      const response = await trigger(preparedData);
      if (response) {
        globalMutate("/api/v1/dj/templates/");
      }
    } catch (error) {
      console.error(error);
    }
  };
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  return (
    <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
      <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
        <EuiFlexItem grow={false}>
          <EuiFormRow
            label="Subject"
            isInvalid={!!errors.title?.message}
            error={[errors.title?.message]}
          >
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiFieldText
                  onChange={onChange}
                  value={value}
                  onBlur={onBlur}
                  readOnly={isView}
                  isInvalid={!!errors.title?.message}
                  placeholder="Subject"
                  aria-label="Subject"
                />
              )}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          {isView && (
            <EuiFlexGroup gutterSize="xl" alignItems="flexEnd" justifyContent="flexEnd">
              {(data?.status === "DRAFT" || data?.status === "ERROR") && (
                <EuiFlexItem grow={false}>
                  <EuiToolTip position="top" content="move to the update screen">
                    <EuiButtonIcon
                      display={"base"}
                      iconType="documentEdit"
                      size="s"
                      onClick={() => {
                        setView();
                      }}
                    />
                  </EuiToolTip>
                </EuiFlexItem>
              )}
            </EuiFlexGroup>
          )}
          {!isView && (
            <EuiFlexGroup justifyContent="flexEnd" alignItems="flexEnd">
              <EuiFlexItem>
                <EuiToolTip position="top" content="Cancel">
                  <EuiButtonIcon
                    display={"base"}
                    iconType="cross"
                    size="s"
                    color="success"
                    onClick={() => {
                      setView();
                      reset();
                    }}
                  />
                </EuiToolTip>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiButton isLoading={isMutating} disabled={isMutating} size="s" type="submit">
                  Update Campaign
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="s" />
      <EuiFlexGroup direction="column">
        {dataKind === "api" && (
          <EuiFormRow
            fullWidth
            label="Data"
            helpText="Use custom attributes to make data dynamic. {{custom_attribute}}"
            isInvalid={!!errors?.body?.message}
            error={[errors?.body?.message]}
          >
            <>
              {!isView && <AceEditorComponent control={control} onChange={setAceEditorValue} />}
              {isView && (
                <EuiFlexItem>
                  <EuiCodeBlock
                    language="json"
                    fontSize="s"
                    paddingSize="s"
                    isCopyable
                    overflowHeight={300}
                  >
                    <pre>{JSON.stringify(JSON.parse(jsonrepair(data?.body || "{}")), null, 2)}</pre>
                  </EuiCodeBlock>
                </EuiFlexItem>
              )}
            </>
          </EuiFormRow>
        )}
        {(dataKind === "sms" || dataKind === "push") && (
          <EuiFormRow
            fullWidth
            label="Data"
            helpText="Use custom attributes to make data dynamic. {{custom_attribute}}"
            isInvalid={!!errors?.body?.message}
            error={[errors?.body?.message]}
          >
            <Controller
              control={control}
              name="body"
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiTextArea
                  onChange={onChange}
                  value={value}
                  onBlur={onBlur}
                  isInvalid={!!errors.title?.message}
                  readOnly={isView}
                  placeholder="Data"
                  aria-label="data"
                  fullWidth
                />
              )}
            />
          </EuiFormRow>
        )}
      </EuiFlexGroup>
    </EuiForm>
  );
};

export default GeneralDetails;
