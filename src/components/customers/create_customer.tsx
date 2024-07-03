import {
  useGeneratedHtmlId,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiTitle,
  EuiFlyoutBody,
  EuiForm,
  EuiFlexItem,
  EuiFormRow,
  EuiFieldText,
  EuiFieldNumber,
  EuiButton,
  EuiFlexGrid,
  EuiSpacer,
  EuiDatePicker,
  EuiSwitch,
} from "@elastic/eui";
import { SetStateAction } from "react";
import useCreateCustomer from "../../hooks/useCreateCustomer";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { addToast } from "../toast";
import useGetFields, { FieldsResponse } from "../../hooks/useGetFields";
import { Moment } from "moment";

const schema = yup
  .object({
    email: yup.string().email().required("please enter your email address"),
    phone: yup.number().min(6).required("please enter your phone"),
    rid: yup.string().required("please enter your registration"),
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
  })
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
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <EuiFlyout onClose={() => setIsFlyoutVisible(false)}>
      <EuiFlyoutHeader hasBorder aria-labelledby={flyoutHeadingId}>
        <EuiTitle>
          <h2 id={flyoutHeadingId}>Create customer</h2>
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
                <EuiFlexGrid key={field.id} columns={2}>
                  <EuiFlexItem>
                    <EuiFormRow label={`${field.attribute_name} (${field.data_type})`}>
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
                    {field.data_type === "str" && (
                      <EuiFormRow label="Data">
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
                              placeholder="Data"
                              aria-label="email"
                            />
                          )}
                        />
                      </EuiFormRow>
                    )}
                    {field.data_type === "int" && (
                      <EuiFormRow label="Data">
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
                              placeholder="Data"
                              aria-label="email"
                            />
                          )}
                        />
                      </EuiFormRow>
                    )}
                    {field.data_type === "datetime" && (
                      <EuiFormRow label="Data">
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
                              placeholder={field.data_type}
                              aria-label="email"
                            />
                          )}
                        />
                      </EuiFormRow>
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
                            />
                          )}
                        />
                      </EuiFormRow>
                    )}
                    {field.data_type === "date" && (
                      <EuiFormRow label="Data">
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
                              placeholder={field.data_type}
                              aria-label="email"
                            />
                          )}
                        />
                      </EuiFormRow>
                    )}
                  </EuiFlexItem>
                </EuiFlexGrid>
              </>
            ))}
          <EuiFormRow hasEmptyLabelSpace>
            <EuiButton type="submit">Create customer</EuiButton>
          </EuiFormRow>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default CreateCustomerComponent;
