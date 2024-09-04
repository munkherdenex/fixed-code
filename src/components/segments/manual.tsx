import {
  EuiButton,
  EuiCodeBlock,
  EuiFilePicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiSelect,
  EuiSpacer,
  EuiTab,
  EuiTabs,
  EuiText,
  EuiTextArea,
  EuiTourStep,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { Fragment, useMemo, useState } from "react";
import { Control, Controller, FieldValues, useForm } from "react-hook-form";
import * as yup from "yup";
import useCreateSegmentManualFile from "../../hooks/useCreateSegmentManualFile";
import useCreateSegmentManualText from "../../hooks/useCreateSegmentManualText";
import { commonStyles } from "../../styles/global.styles";

const FileContent = ({ control }: { control: Control<FieldValues, any> }) => {
  const styles = commonStyles();
  const [isTourOpen, setIsTourOpen] = useState(() => {
    return localStorage.getItem("isManualSegmentTourOpen") === "false" ? false : true;
  });

  return (
    <Fragment>
      <EuiTourStep
        content={
          <div>
            <EuiText>
              <p>
                Upload a CSV file with the following columns like: email, phone, first_name,
                last_name, and any other custom fields you want to include. The first row should be
                the header row with the column names.
              </p>
            </EuiText>
          </div>
        }
        isStepOpen={isTourOpen}
        minWidth={300}
        onFinish={() => {
          setIsTourOpen(false);
          localStorage.setItem("isManualSegmentTourOpen", "false");
        }}
        step={1}
        stepsTotal={1}
        title="File Upload"
        anchorPosition="rightUp"
        css={styles.tourStep}
      >
        <Controller
          control={control}
          name="file"
          render={({
            field: { onChange, onBlur },
            formState: {
              errors: { file: errors },
            },
          }) => {
            return (
              <EuiFilePicker
                multiple={false}
                onBlur={onBlur}
                onChange={(files) => {
                  onChange(files[0]);
                }}
                isInvalid={!!errors}
                display="large"
                initialPromptText="Select or drag and drop file"
                aria-label="Select or drag and drop file"
                accept=".csv"
              />
            );
          }}
        />
      </EuiTourStep>
    </Fragment>
  );
};

const TextContent = ({ control }: { control: Control<FieldValues, any> }) => {
  const styles = commonStyles();
  const [isTourOpen, setIsTourOpen] = useState(() => {
    return localStorage.getItem("isSegmentTextTourOpen") === "false" ? false : true;
  });

  return (
    <Fragment>
      <Controller
        control={control}
        name="text"
        render={({
          field: { onChange, onBlur, value },
          formState: {
            errors: { file: errors },
          },
        }) => {
          return (
            <EuiTourStep
              content={
                <div>
                  <EuiText>
                    <p>
                      Enter the text you want to use for segmenting your users. You can also choose
                      the type of data you are entering, such as email or phone number
                    </p>
                  </EuiText>
                  <EuiSpacer />
                  <EuiCodeBlock>a@gmail.com,a@gmail.com,...</EuiCodeBlock>
                </div>
              }
              isStepOpen={isTourOpen && !value}
              minWidth={300}
              onFinish={() => {
                setIsTourOpen(false);
                localStorage.setItem("isManualSegmentTourOptionsOpen", "false");
                localStorage.setItem("isSegmentTextTourOpen", "false");
              }}
              step={1}
              stepsTotal={2}
              title="Text Input"
              anchorPosition="rightUp"
              css={styles.tourStep}
            >
              <EuiTextArea
                onChange={onChange}
                value={value}
                onBlur={onBlur}
                isInvalid={!!errors}
                placeholder="Placeholder text"
                name="text"
                aria-label="Use aria labels when no actual label is in use"
              />
            </EuiTourStep>
          );
        }}
      />
    </Fragment>
  );
};

const tabs = [
  {
    id: "file",
    name: "Files",
    content: (control: Control<FieldValues, any>) => <FileContent control={control} />,
  },
  {
    id: "text",
    name: "Text",
    content: (control: Control<FieldValues, any>) => <TextContent control={control} />,
  },
];

const dataTypeOptions = [
  { value: "email", text: "Email" },
  { value: "phone", text: "Phone" },
];

const schema = yup.object({
  file: yup
    .mixed<FileList>() // Pass in the type of `fileUpload`
    .test(
      "fileSize",
      "Only documents up to 20MB are permitted.",
      (files) =>
        !files || // Check if `files` is defined
        files.length === 0 || // Check if `files` is not an empty list
        Array.from(files).every((file) => file.size <= 20_00_000),
    ),
  text: yup.string(),
  text_type: yup.string().oneOf(["email", "phone"]).notRequired(),
  input_type: yup.string().oneOf(["file", "text"]),
});

type MyFormData = yup.InferType<typeof schema>;

const Manual = ({ name, description }: { name: string; description: string }) => {
  const styles = commonStyles();
  const router = useRouter();
  const { trigger: createSegmentFile, isMutating: isCreateSegmentFileMutating } =
    useCreateSegmentManualFile();
  const { trigger: createSegmentText, isMutating: isCreateSegmentMutating } =
    useCreateSegmentManualText();

  const [isTourOpen, setIsTourOpen] = useState(() => {
    return localStorage.getItem("isManualSegmentTourOptionsOpen") === "false" ? false : true;
  });

  const {
    handleSubmit,
    control,
    setError,
    clearErrors,
    setValue,
    resetField,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
  });

  const [selectedTabId, setSelectedTabId] = useState("file");

  const selectedTabContent = useMemo(() => {
    setValue("input_type", selectedTabId);
    return tabs.find((obj) => obj.id === selectedTabId)?.content;
  }, [selectedTabId, setValue]);

  const onSelectedTabChanged = (id: string) => {
    clearErrors();
    resetField("file");
    resetField("text");
    resetField("text_type");
    setSelectedTabId(id);
  };

  const renderTabs = () => {
    return tabs.map((tab, index) => (
      <EuiTab
        key={index}
        onClick={() => onSelectedTabChanged(tab.id)}
        isSelected={tab.id === selectedTabId}
      >
        {tab.name}
      </EuiTab>
    ));
  };

  const testHandle = async (data: MyFormData) => {
    if (!data.file && selectedTabId === "file") {
      return setError("file", {
        type: "manual",
        message: "Please select a file",
      });
    }

    if (!data.text && selectedTabId === "text") {
      return setError("text", {
        type: "manual",
        message: "Please enter some text",
      });
    }

    if (!data.text_type && selectedTabId === "text") {
      return setError("text_type", {
        type: "manual",
        message: "Please choose type",
      });
    }

    if (selectedTabId === "file") {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("type", "manual");
      formData.append("file", data.file[0]);

      const fileResponse = await createSegmentFile(formData);

      if (fileResponse) {
        router.push("/dashboards/segments");
      }
    }

    if (selectedTabId === "text") {
      const textResponse = await createSegmentText({
        name,
        description,
        type: "manual",
        text: data.text,
      });

      if (textResponse) {
        router.push("/dashboards/segments");
      }
    }
  };

  return (
    <div>
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiTabs>{renderTabs()}</EuiTabs>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiForm component="form" onSubmit={handleSubmit(testHandle)}>
            <EuiFormRow
              isInvalid={!!errors?.[selectedTabId]?.message}
              error={[errors?.[selectedTabId]?.message]}
            >
              {selectedTabContent(control)}
            </EuiFormRow>
            {selectedTabId === "text" && (
              <EuiFormRow
                label="Text type"
                isInvalid={!!errors.text_type?.message}
                error={[errors.text_type?.message]}
              >
                <EuiTourStep
                  content={
                    <div>
                      <EuiText>
                        <p>
                          Choose the type of data you are entering, such as email or phone number
                        </p>
                      </EuiText>
                    </div>
                  }
                  isStepOpen={isTourOpen && !!watch("text")}
                  minWidth={300}
                  onFinish={() => {
                    setIsTourOpen(false);
                    localStorage.setItem("isManualSegmentTourOptionsOpen", "false");
                    localStorage.setItem("isSegmentTextTourOpen", "false");
                  }}
                  step={2}
                  stepsTotal={2}
                  title="Choose Text Type"
                  anchorPosition="rightUp"
                  css={styles.tourStep}
                >
                  <Controller
                    control={control}
                    name="text_type"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <EuiSelect
                        onChange={onChange}
                        value={value}
                        options={dataTypeOptions}
                        onBlur={onBlur}
                        isInvalid={!!errors.text_type?.message}
                        aria-label="channel type"
                        hasNoInitialSelection
                      />
                    )}
                  />
                </EuiTourStep>
              </EuiFormRow>
            )}
            <EuiButton type="submit" isLoading={isCreateSegmentMutating}>
              Create
            </EuiButton>
          </EuiForm>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
};

export default Manual;
