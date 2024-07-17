import {
  EuiButton,
  EuiDatePicker,
  EuiFieldNumber,
  EuiFieldText,
  EuiFlexGrid,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  EuiSwitch,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { Moment } from "moment";
import { SetStateAction } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import useCreateCustomer from "../../hooks/useCreateCustomer";
import useGetFields, { FieldsResponse } from "../../hooks/useGetFields";
import { globalMutate } from "../../utils/globalMutate";
import { addToast } from "../toast";

const schema = yup
  .object()
  .shape(
    {
      email: yup
        .string()
        .email()
        .when(["phone", "rid"], {
          is: (phone: number, rid: string) => !rid && !phone,
          then: (schema) => schema.required(),
          otherwise: (schema) => schema.notRequired(),
        })
        .label("Email address"),
      phone: yup
        .number()
        .when(["email", "rid"], {
          is: (email: string, rid: string) => !email && !rid,
          then: (schema) => schema.required(),
          otherwise: (schema) => schema.notRequired(),
        })
        .label("Phone number"),
      rid: yup
        .string()
        .when(["email", "phone"], {
          is: (email: string, phone: string) => !email && !phone,
          then: (schema) => schema.required(),
          otherwise: (schema) => schema.notRequired(),
        })
        .label("Reference ID"),
      customer_data: yup
        .array(
          yup
            .object({
              name: yup.string().required(),
              value: yup.mixed().required(),
            })
            .notRequired(),
        )
        .notRequired(),
    },
    [
      ["email", "phone"],
      ["email", "rid"],
      ["phone", "rid"],
    ],
  )
  .required();

type FormData = yup.InferType<typeof schema>;

const CreateCustomerComponent = ({
  setIsFlyoutVisible,
}: {
  setIsFlyoutVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const flyoutHeadingId = useGeneratedHtmlId();
  const { trigger } = useCreateCustomer();
  const { data } = useGetFields<FieldsResponse>();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
    defaultValues: {
      customer_data: [],
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const preparedData = {
        ...data,
        customer_data: data.customer_data.reduce((a, v) => ({ ...a, [v.name]: v.value }), {}),
      };

      const response = await trigger(preparedData);
      if (response) {
        setIsFlyoutVisible(false);
        addToast({
          id: "customer-success",
          color: "success",
          title: "Success",
          text: "Successfully register",
        });
        globalMutate(`/api/v1/dj/customers/`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <EuiFlyout onClose={() => setIsFlyoutVisible(false)}>
      <EuiFlyoutHeader hasBorder aria-labelledby={flyoutHeadingId}>
        <EuiTitle>
          <h2 id={flyoutHeadingId}>Create audience</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
          <EuiFormRow
            label="Email address"
            isInvalid={!!errors.email?.message}
            error={[errors.email?.message]}
          >
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiFieldText
                  onChange={onChange}
                  value={value}
                  onBlur={onBlur}
                  isInvalid={!!errors.email?.message}
                  placeholder="Email address"
                  aria-label="email"
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow
            label="Phone number"
            isInvalid={!!errors.phone?.message}
            error={[errors.phone?.message]}
          >
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiFieldNumber
                  onChange={onChange}
                  value={value}
                  onBlur={onBlur}
                  isInvalid={!!errors.phone?.message}
                  placeholder="Phone number"
                  aria-label="phone"
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow
            label="Reference ID"
            isInvalid={!!errors.rid?.message}
            error={[errors.rid?.message]}
          >
            <Controller
              control={control}
              name="rid"
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiFieldText
                  onChange={onChange}
                  value={value}
                  onBlur={onBlur}
                  isInvalid={!!errors.rid?.message}
                  placeholder="Reference ID"
                  aria-label="rid"
                />
              )}
            />
          </EuiFormRow>
          {data?.results &&
            Array.isArray(data?.results) &&
            data?.results.map((field, index) => (
              <>
                <EuiSpacer />
                <strong>Custom attributes</strong>
                <EuiSpacer size="s" />
                <EuiFlexGrid key={field.id} columns={2}>
                  <EuiFlexItem style={{ visibility: "hidden", display: "none" }}>
                    <EuiFormRow label={`${field.name} (${field.data_type})`}>
                      <Controller
                        control={control}
                        name={`customer_data.${index}.name`}
                        defaultValue={field.attribute_name}
                        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                          <EuiFieldText
                            onChange={onChange}
                            value={value}
                            onBlur={onBlur}
                            isInvalid={!!error?.message}
                            placeholder="Name"
                            aria-label="name"
                            readOnly
                          />
                        )}
                      />
                    </EuiFormRow>
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <EuiFormRow label={`${field.name} (${field.data_type})`}>
                      <>
                        {field.data_type === "str" && (
                          <Controller
                            control={control}
                            name={`customer_data.${index}.value`}
                            render={({
                              field: { onChange, onBlur, value },
                              fieldState: { error },
                            }) => (
                              <EuiFieldText
                                onChange={onChange}
                                value={value as string}
                                onBlur={onBlur}
                                isInvalid={!!error?.message}
                                placeholder={field.name}
                                aria-label={field.data_type}
                              />
                            )}
                          />
                        )}
                        {field.data_type === "int" && (
                          <Controller
                            control={control}
                            name={`customer_data.${index}.value`}
                            render={({
                              field: { onChange, onBlur, value },
                              fieldState: { error },
                            }) => (
                              <EuiFieldNumber
                                onChange={onChange}
                                value={value as number}
                                onBlur={onBlur}
                                isInvalid={!!error?.message}
                                placeholder={field.name}
                                aria-label={field.data_type}
                              />
                            )}
                          />
                        )}
                        {field.data_type === "datetime" && (
                          <Controller
                            control={control}
                            name={`customer_data.${index}.value`}
                            render={({
                              field: { onChange, onBlur, value },
                              fieldState: { error },
                            }) => (
                              <EuiDatePicker
                                showTimeSelect
                                selected={value as Moment}
                                onChange={onChange}
                                onBlur={onBlur}
                                isInvalid={!!error?.message}
                                placeholder={field.name}
                                aria-label={field.data_type}
                              />
                            )}
                          />
                        )}
                        {field.data_type === "bool" && (
                          <EuiFormRow label="Data">
                            <Controller
                              control={control}
                              name={`customer_data.${index}.value`}
                              render={({ field: { onChange, onBlur, value } }) => (
                                <EuiSwitch
                                  label="Data"
                                  checked={value as boolean}
                                  onBlur={onBlur}
                                  onChange={(e) => onChange(e.target.checked)}
                                  aria-label={field.data_type}
                                />
                              )}
                            />
                          </EuiFormRow>
                        )}
                        {field.data_type === "date" && (
                          <Controller
                            control={control}
                            name={`customer_data.${index}.value`}
                            render={({
                              field: { onChange, onBlur, value },
                              fieldState: { error },
                            }) => (
                              <EuiDatePicker
                                selected={value as Moment}
                                onChange={onChange}
                                onBlur={onBlur}
                                isInvalid={!!error?.message}
                                placeholder={field.name}
                                aria-label={field.data_type}
                              />
                            )}
                          />
                        )}
                      </>
                    </EuiFormRow>
                  </EuiFlexItem>
                </EuiFlexGrid>
              </>
            ))}
          <EuiFormRow hasEmptyLabelSpace>
            <EuiButton type="submit">Create audience</EuiButton>
          </EuiFormRow>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default CreateCustomerComponent;
