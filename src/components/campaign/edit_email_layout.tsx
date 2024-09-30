import {
  EuiButton,
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  EuiToolTip,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { IS_POCKET } from "../../constants";
import useUpdateTemplate from "../../hooks/useUpdateTemplate";
import { useCampaignContext } from "../../store/campaign_store";
import { globalMutate } from "../../utils/globalMutate";
import { dataTypeToSwitch, processBody, processKind } from "../../utils/helper";
import { isJson } from "../../utils/is_json";
import { quillEditorStyles } from "../email_editor/quill_editor.styles";
import { addToast } from "../toast";
import TestEmailLayout from "./test_email_layout";

const QuillEditorComponent = dynamic(() => import("../email_editor/quill_editor"), { ssr: false });

const schema = yup
  .object({
    title: yup.string().required().label("Title"),
    kind: yup.string().oneOf(["email", "sms", "push", "inapp", "api"]).required().label("Data"),
    description: yup.string().label("Description"),
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

type EmailFormData = yup.InferType<typeof schema>;

const EditEmailLayout = () => {
  const router = useRouter();
  const styles = quillEditorStyles();

  const [isViewEmail, setIsViewEmail] = useState(true);
  const [isTestLayout, setIsTestLayout] = useState(false);

  const { data } = useCampaignContext();
  const { isMutating, trigger } = useUpdateTemplate(router.query.id);

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
    defaultValues: {
      kind: processKind(data?.body, data?.kind),
      body: processBody(data?.body, processKind(data?.body, data?.kind)),
      description: data?.description,
      title: data?.title,
      channel: data?.channel,
    },
  });

  const setView = () => {
    setIsViewEmail((prev) => !prev);
  };

  const setReactQuill = (value: string) => {
    setValue("body", value);
  };

  const closeFlyout = () => {
    setIsTestLayout(false);
  };

  const onSubmit = async (data: EmailFormData) => {
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
          description: data?.description,
          title: data?.title,
          body: data?.body,
        });
      }

      const response = await trigger(preparedData);
      if (response) {
        globalMutate("/api/v1/dj/templates/");
        addToast({
          id: "success",
          title: "Successfully updated",
          color: "success",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
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
                    readOnly={isViewEmail}
                    isInvalid={!!errors.title?.message}
                    placeholder="Subject"
                    aria-label="Subject"
                  />
                )}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            {isViewEmail && (
              <EuiFlexGroup gutterSize="xl" alignItems="flexEnd" justifyContent="flexEnd">
                <EuiFlexItem grow={false}>
                  <EuiToolTip position="top" content="send test function on Email campaign">
                    <EuiButton
                      size="s"
                      onClick={() => {
                        setIsTestLayout(true);
                      }}
                    >
                      Test
                    </EuiButton>
                  </EuiToolTip>
                </EuiFlexItem>
                {(data?.status === "DRAFT" || data?.status === "ERROR") && (
                  <EuiFlexItem grow={false}>
                    <EuiToolTip position="top" content="move to the update screen">
                      <EuiButtonIcon
                        display={"base"}
                        iconType="documentEdit"
                        aria-label="Edit"
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
            {!isViewEmail && (
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
                  <EuiButton isLoading={isMutating} size="s" type="submit">
                    Update Campaign
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="s" />
        <EuiFormRow
          label="Body"
          isInvalid={!!errors?.body?.message}
          error={[errors?.body?.message]}
          css={styles.quillEditorContainer}
        >
          <QuillEditorComponent readonly={isViewEmail} control={control} onChange={setReactQuill} />
        </EuiFormRow>
      </EuiForm>
      {isTestLayout && <TestEmailLayout closeFlyout={closeFlyout} />}
    </>
  );
};

export default EditEmailLayout;
