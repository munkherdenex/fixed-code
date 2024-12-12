import {
  EuiButton,
  EuiFieldText,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiSelect,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { CUSTOM_DATA_TYPE_OPTIONS } from "../../constants";
import useCreateField from "../../hooks/useCreateCustomField";
import { globalMutate } from "../../utils/globalMutate";
import { useTranslations } from "next-intl";

const schema = yup
  .object({
    name: yup.string().required().label("Name"),
    attribute_name: yup
      .string()
      .matches(/^[a-zA-Z0-9_]+$/, "Only alphanumeric characters are allowed.")
      .required()
      .label("Attribute name"),
    data_type: yup
      .string()
      .oneOf(["int", "str", "datetime", "bool", "date"])
      .required()
      .label("Data type"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const CreateFieldFlyout = ({ closeFlyout }: { closeFlyout: () => void }) => {
  const translate = useTranslations();
  const { trigger, isMutating } = useCreateField<FormData>();
  const flyoutHeadingId = useGeneratedHtmlId({
    prefix: "flyoutTitle",
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      data_type: "int",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await trigger(data);
      if (response) {
        globalMutate("fields");
        closeFlyout();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <EuiFlyout onClose={closeFlyout}>
      <EuiFlyoutHeader hasBorder aria-labelledby={flyoutHeadingId}>
        <EuiTitle>
          <h2>{translate("create_custom_attribute")}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
          <EuiFormRow
            label={translate("name")}
            isInvalid={!!errors.name?.message}
            error={[errors.name?.message]}
          >
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiFieldText
                  onChange={onChange}
                  value={value}
                  onBlur={onBlur}
                  isInvalid={!!errors.name?.message}
                  placeholder={translate("name")}
                  aria-label={translate("name")}
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow
            label={translate("attribute_name")}
            isInvalid={!!errors.attribute_name?.message}
            error={[errors.attribute_name?.message]}
          >
            <Controller
              control={control}
              name="attribute_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiFieldText
                  onChange={onChange}
                  value={value}
                  onBlur={onBlur}
                  isInvalid={!!errors.attribute_name?.message}
                  placeholder={translate("attribute_name")}
                  aria-label={translate("attribute_name")}
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow
            label={translate("data_type")}
            isInvalid={!!errors.data_type?.message}
            error={[errors.data_type?.message]}
          >
            <Controller
              control={control}
              name="data_type"
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiSelect
                  onChange={onChange}
                  value={value}
                  options={CUSTOM_DATA_TYPE_OPTIONS}
                  onBlur={onBlur}
                  isInvalid={!!errors.data_type?.message}
                  aria-label={translate("data_type")}
                  hasNoInitialSelection
                />
              )}
            />
          </EuiFormRow>
          <EuiButton isLoading={isMutating} disabled={isMutating} type="submit">
            {translate("create_custom_attribute")}
          </EuiButton>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default CreateFieldFlyout;
