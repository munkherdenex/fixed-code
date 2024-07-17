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
import moment, { Moment } from "moment";
import { useRouter } from "next/router";
import { SetStateAction, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { mutate } from "swr";
import * as yup from "yup";
import useGetCustomers, { CustomersType } from "../../hooks/useGetCustomers";
import useGetFields, { FieldsResponse } from "../../hooks/useGetFields";
import useUpdateCustomer from "../../hooks/useUpdateCustomer";
import { addToast } from "../toast";

const schema = yup
  .object({
    email: yup.string().email().required("please enter your email address"),
    phone: yup.number().min(6).required("please enter your phone"),
    rid: yup.string().required("please enter your registration"),
    customer_data: yup.array(
      yup.object({
        name: yup.string().required("please enter your name"),
        value: yup.mixed().required("please enter your value"),
      }),
    ),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const UpdateCustomerComponent = ({
  setIsFlyoutVisible,
}: {
  setIsFlyoutVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const flyoutHeadingId = useGeneratedHtmlId();
  const router = useRouter();
  const { trigger, isMutating } = useUpdateCustomer(router.query.id);
  const { data: detailData, isLoading: getCustomersIsLoading } = useGetCustomers<CustomersType>(
    router.query.id,
  );
  const { data, isLoading: getFieldsIsLoading } = useGetFields<FieldsResponse>();

  const preparedData = data?.results
    ?.map((field) => {
      const customerData = detailData?.customer_data;
      if (!customerData) return null;

      const value = customerData[field.attribute_name];
      if (value === undefined) return null;

      let formattedValue;

      switch (field.data_type) {
        case "datetime":
        case "date":
          formattedValue = moment(value);
          break;
        case "bool":
          formattedValue = !!value;
          break;
        case "int":
          formattedValue = +value;
          break;
        default:
          formattedValue = value;
      }

      return {
        name: field.attribute_name,
        value: formattedValue,
      };
    })
    .filter((item) => item !== null);

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
    defaultValues: {
      email: detailData?.email || "",
      phone: +detailData?.phone || 0,
      rid: detailData?.rid || "",
      customer_data: preparedData,
    },
  });

  useEffect(() => {
    setValue("customer_data", preparedData);
  }, [preparedData, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      const preparedData = {
        ...data,
        customer_data: data.customer_data.reduce((a, v) => ({ ...a, [v.name]: v.value }), {}),
      };

      const response = await trigger(preparedData);
      if (response) {
        mutate(`/api/v1/dj/customers/${router.query.id}/?extended=true`);
        setIsFlyoutVisible(false);
        addToast({
          id: "customer-success",
          color: "success",
          title: "Success",
          text: "Successfully registered",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (getCustomersIsLoading || getFieldsIsLoading) return <div>Loading...</div>;

  return (
    <EuiFlyout onClose={() => setIsFlyoutVisible(false)}>
      <EuiFlyoutHeader hasBorder aria-labelledby={flyoutHeadingId}>
        <EuiTitle>
          <h2 id={flyoutHeadingId}>Update audience</h2>
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
            isInvalid={!!errors.email?.message}
            error={[errors.email?.message]}
          >
            <Controller
              control={control}
              name="rid"
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiFieldText
                  onChange={onChange}
                  value={value}
                  onBlur={onBlur}
                  isInvalid={!!errors.email?.message}
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
            <EuiButton isLoading={isMutating} type="submit">
              Update audience
            </EuiButton>
          </EuiFormRow>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default UpdateCustomerComponent;
