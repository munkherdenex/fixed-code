import {
  EuiButton,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiFilePicker,
  EuiTitle,
  EuiText,
  EuiTourStep,
  useGeneratedHtmlId,
} from "@elastic/eui";
import React, { useState, Fragment } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { SetStateAction } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { globalMutate } from "../../utils/globalMutate";
import { addToast } from "../toast";
import { commonStyles } from "../../styles/global.styles";
import useImportAudience from "../../hooks/useImportAudience";
import { useTranslations } from "next-intl";

const ImportAudienceSchema = yup
  .object({
    file: yup.mixed().required("File is required"),
  })
  .required();

type MyFormData = yup.InferType<typeof ImportAudienceSchema>;

const ImportAudienceComponent = ({
  setIsImportFlyoutVisible,
}: {
  setIsImportFlyoutVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const flyoutHeadingId = useGeneratedHtmlId();
  const translate = useTranslations();
  const { trigger, isMutating } = useImportAudience();

  const styles = commonStyles();
  const [isTourOpen, setIsTourOpen] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ImportAudienceSchema),
  });

  const onSubmit = async (data: MyFormData) => {
    try {
      const response = await trigger(data);
      if (response) {
        setIsImportFlyoutVisible(false);
        addToast({
          id: "audience-success",
          color: "success",
          title: "Success",
          text: "Successfully imported",
        });
        globalMutate(`/api/v1/dj/customers/`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <EuiFlyout onClose={() => setIsImportFlyoutVisible(false)}>
      <EuiFlyoutHeader hasBorder aria-labelledby={flyoutHeadingId}>
        <EuiTitle>
          <h2 id={flyoutHeadingId}>{translate("import-audience")}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
          <EuiFormRow
            label={translate("upload-file")}
            isInvalid={!!errors.file?.message}
            error={[errors.file?.message]}
          >
            <Fragment>
              <EuiTourStep
                content={
                  <div>
                    <EuiText>
                      <p>Upload a CSV file</p>
                    </EuiText>
                  </div>
                }
                isStepOpen={isTourOpen}
                minWidth={300}
                onFinish={() => {
                  setIsTourOpen(true);
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
                          onChange(files);
                        }}
                        isInvalid={!!errors}
                        display="large"
                        disabled={isMutating}
                        initialPromptText={translate("upload-file-description")}
                        aria-label={translate("upload-file-description")}
                        accept=".csv"
                      />
                    );
                  }}
                />
              </EuiTourStep>
            </Fragment>
          </EuiFormRow>
          <EuiFormRow hasEmptyLabelSpace>
            <EuiButton type="submit" isLoading={isMutating} disabled={isMutating}>
              {translate("import")}
            </EuiButton>
          </EuiFormRow>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default ImportAudienceComponent;
