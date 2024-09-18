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
import { useRouter } from "next/router";
import { SetStateAction } from "react";
import { Controller, useForm } from "react-hook-form";
import { mutate } from "swr";
import * as yup from "yup";
import { CUSTOM_DATA_TYPE_OPTIONS } from "../../constants";
import { Fields } from "../../hooks/useGetFields";
import useUpdateField from "../../hooks/useUpdateField";

const schema = yup
  .object({
    name: yup.string().required(),
    attribute_name: yup.string().required(),
    data_type: yup.string().oneOf(["int", "str", "datetime", "bool", "date"]).required(),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const UpdateFieldFlyout = ({
  setIsFlyoutVisible,
  data,
}: {
  setIsFlyoutVisible: React.Dispatch<SetStateAction<boolean>>;
  data: Fields;
}) => {
  const router = useRouter();
  const { trigger, isMutating } = useUpdateField<FormData>(router.query.id);
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
      data_type: data.data_type,
      name: data.name,
      attribute_name: data.attribute_name,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await trigger(data);
      if (response) {
        mutate(`/api/v1/dj/fields/`);
        setIsFlyoutVisible(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <EuiFlyout onClose={() => setIsFlyoutVisible(false)}>
      <EuiFlyoutHeader hasBorder aria-labelledby={flyoutHeadingId}>
        <EuiTitle>
          <h2>Update custom attribute</h2>
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
            isInvalid={!!errors.attribute_name?.message}
            error={[errors.attribute_name?.message]}
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
                  aria-label="data type"
                />
              )}
            />
          </EuiFormRow>
          <EuiButton isLoading={isMutating} type="submit">
            Update custom attribute
          </EuiButton>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default UpdateFieldFlyout;
