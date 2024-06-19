import {
  EuiTab,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTabs,
  EuiForm,
  EuiFormRow,
  EuiFilePicker,
  EuiButton,
  EuiTextArea,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { Fragment, useState, useMemo } from "react";
import { Control, Controller, FieldValues, useForm } from "react-hook-form";
import * as yup from "yup";

const tabs = [
  {
    id: "file",
    name: "Files",
    content: (control: Control<FieldValues, any>) => {
      return (
        <Fragment>
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
        </Fragment>
      );
    },
  },
  {
    id: "text",
    name: "Text",
    content: (control: Control<FieldValues, any>) => {
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
                <EuiTextArea
                  onChange={onChange}
                  value={value}
                  onBlur={onBlur}
                  isInvalid={!!errors}
                  placeholder="Placeholder text"
                  name="text"
                  aria-label="Use aria labels when no actual label is in use"
                />
              );
            }}
          />
        </Fragment>
      );
    },
  },
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
});

const Manual = ({
  createSegment,
  isCreateSegmentMutating,
}: {
  createSegment: (data: any) => void;
  isCreateSegmentMutating: boolean;
}) => {
  const {
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [selectedTabId, setSelectedTabId] = useState("file");

  const selectedTabContent = useMemo(() => {
    return tabs.find((obj) => obj.id === selectedTabId)?.content;
  }, [selectedTabId]);

  const onSelectedTabChanged = (id: string) => {
    clearErrors();
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

  const testHandle = (data) => {
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

    if (data.file && selectedTabId === "file") {
      return createSegment({
        file: data.file,
      });
    }

    if (data.text && selectedTabId === "text") {
      return createSegment({
        text: data.text,
      });
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
