import {
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonIcon,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  EuiButton,
  EuiToolTip,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { IS_POCKET } from "../../constants";
import useUpdateTemplate from "../../hooks/useUpdateTemplate";
import useGetTemplates, { Template } from "../../hooks/useGetTemplates";
import { quillEditorStyles } from "../email_editor/quill_editor.styles";
import { isJson } from "../../utils/is_json";
import { dataTypeToSwitch } from "./create_template_flyot";
import { globalMutate } from "../../utils/globalMutate";
import { addToast } from "../toast";
import QuillEditorComponent from "../email_editor/quill_editor";

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

type EmailFormData = yup.InferType<typeof schema>;

const processKind = (body: string, kind: EmailFormData["kind"]): EmailFormData["kind"] => {
  if (!IS_POCKET) return kind;
  try {
    const parsedBody = JSON.parse(body);
    if (parsedBody.type === "sms") {
      return "sms";
    }
    if (parsedBody.type === "email") {
      return "email";
    }
    if (parsedBody.type === "push") {
      return "push";
    }
  } catch (error) {
    return kind;
  }

  return kind;
};

const processBody = (body: string, kind: string) => {
  if (!IS_POCKET) return body;
  try {
    const parsedBody = JSON.parse(body);
    if (kind === "api") {
      return JSON.stringify(JSON.parse(body), null, 2);
    }
    if (kind === "sms") {
      return parsedBody.body;
    }
    if (kind === "email") {
      return parsedBody.body;
    }
    if (kind === "push") {
      return parsedBody.body;
    }
  } catch (error) {
    return body;
  }
};
const pathPrefix = process.env.PATH_PREFIX;

const EditEmailLayout = ({
  templateStatus,
  setView,
}: {
  templateStatus?: "DRAFT" | "APPROVED" | "PUBLISHED" | "DONE" | "ERROR";
  setView?: (res: boolean) => void;
}) => {
  const router = useRouter();
  const { isMutating, trigger } = useUpdateTemplate(router.query.id);
  const { data } = useGetTemplates<Template>(
    router.query.id,
    {},
    {
      refreshInterval: templateStatus !== "DRAFT" ? 1000 : 0,
    },
  );

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
      title: data?.title,
      channel: data?.channel,
    },
  });
  const styles = quillEditorStyles();

  const setReactQuill = (value: string) => {
    setValue("body", value);
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
      const dataType = processKind(data.body, data.kind);
      if ((dataType === "email" || dataType === "sms" || dataType === "push") && IS_POCKET) {
        preparedData.kind = "api";
        preparedData.body = JSON.stringify({
          type: dataType,
          to: `{{${dataTypeToSwitch(data.kind)}}}`,
          title: data.title,
          body: data.body,
        });
      }

      const response = await trigger(preparedData);
      if (response) {
        globalMutate("/api/v1/dj/templates/");
        router.push(`${pathPrefix}/dashboards/campaign/info/${router.query.id}`);
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
                    isInvalid={!!errors.title?.message}
                    placeholder="Subject"
                    aria-label="Subject"
                  />
                )}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup justifyContent="flexEnd" alignItems="flexEnd">
              <EuiFlexItem>
                <EuiToolTip position="top" content="Cancel">
                  <EuiButtonIcon
                    display={"base"}
                    iconType="cross"
                    size="s"
                    color="success"
                    onClick={() => {
                      setView(true);
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
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="s" />
        <EuiFormRow
          label=""
          isInvalid={!!errors?.body?.message}
          error={[errors?.body?.message]}
          css={styles.quillEditorContainer}
        >
          <QuillEditorComponent control={control} onChange={setReactQuill} />
        </EuiFormRow>
      </EuiForm>
    </>
  );
};

export default EditEmailLayout;
