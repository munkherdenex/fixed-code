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
import useCreateField from "../../hooks/useCreateCustomField";
import { globalMutate } from "../../utils/globalMutate";

const schema = yup
  .object({
    name: yup.string().required().label("Name"),
    attribute_name: yup.string().required().label("Attribute name"),
    data_type: yup
      .string()
      .oneOf(["int", "str", "datetime", "bool", "date"])
      .required()
      .label("Data type"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const dataTypeOptions = [
  { value: "int", text: "Int" },
  { value: "str", text: "String" },
  { value: "datetime", text: "Date time" },
  { value: "bool", text: "Boolean" },
  { value: "date", text: "Date" },
];

const CreateFieldFlyout = ({ closeFlyout }: { closeFlyout: () => void }) => {
  const { trigger, isMutating } = useCreateField<FormData>();
  const flyoutHeadingId = useGeneratedHtmlId({
    prefix: "flyoutTitle",
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
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
          <h2>Create custom attribute</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
          <EuiFormRow
            label="Name"
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
                  placeholder="Name"
                  aria-label="name"
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow
            label="Attribute name"
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
                  placeholder="Attribute name"
                  aria-label="Attribute name"
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow
            label="Data type"
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
                  options={dataTypeOptions}
                  onBlur={onBlur}
                  isInvalid={!!errors.data_type?.message}
                  aria-label="data type"
                  hasNoInitialSelection
                />
              )}
            />
          </EuiFormRow>
          <EuiButton isLoading={isMutating} type="submit">
            Create custom attribute
          </EuiButton>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default CreateFieldFlyout;
