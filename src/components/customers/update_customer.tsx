import React from "react";
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
import moment, { Moment } from "moment-timezone";
import { useRouter } from "next/router";
import { SetStateAction, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { mutate } from "swr";
import * as yup from "yup";
import useGetCustomers, { CustomersType } from "../../hooks/useGetCustomers";
import useGetFields, { FieldsResponse } from "../../hooks/useGetFields";
import useUpdateCustomer from "../../hooks/useUpdateCustomer";
import { addToast } from "../toast";
import { createCustomerSchema } from "./schema";

type FormData = yup.InferType<typeof createCustomerSchema>;

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
    {
      extended: "true",
    },
  );
  const { data, isLoading: getFieldsIsLoading } = useGetFields<FieldsResponse>();

  const preparedData = data?.results
    ?.map((field) => {
      const customerData = detailData?.customer_data;

      const value = customerData[field.attribute_name];

      let formattedValue: any;

      switch (field.data_type) {
        case "datetime":
        case "date":
          formattedValue = moment(value);
          break;
        case "bool":
          //TODO: Check this
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
    resolver: yupResolver(createCustomerSchema),
    defaultValues: {
      email: detailData?.email || undefined,
      phone: `${+detailData?.phone}` || undefined,
      rid: detailData?.rid || undefined,
      customer_data: preparedData,
    },
  });

  useEffect(() => {
    setValue("customer_data", preparedData);
  }, [preparedData, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      //TODO: Fix datetime
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
                <EuiFieldText
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
          <EuiSpacer />
          <strong>Custom attributes</strong>
          {data?.results &&
            Array.isArray(data?.results) &&
            data?.results.map((field, index) => (
              <React.Fragment key={index}>
                <EuiSpacer size="s" />
                <EuiFlexGrid key={field.id} columns={2}>
                  <EuiFlexItem style={{ visibility: "hidden", display: "none" }}>
                    <EuiFormRow label={`${field.name} (${field.attribute_name})`}>
                      <Controller
                        control={control}
                        name={`customer_data.${index}.name`}
                        defaultValue={field.attribute_name}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <EuiFieldText
                            onChange={onChange}
                            value={value}
                            onBlur={onBlur}
                            placeholder={field.name}
                            aria-label={field.data_type}
                            disabled
                            readOnly
                          />
                        )}
                      />
                    </EuiFormRow>
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <EuiFormRow label={`${field.name} (${field.attribute_name})`}>
                      <>
                        {field.data_type === "str" && (
                          <Controller
                            control={control}
                            name={`customer_data.${index}.value`}
                            render={({ field: { onChange, onBlur, value } }) => (
                              <EuiFieldText
                                onChange={onChange}
                                value={value as string}
                                onBlur={onBlur}
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
                            render={({ field: { onChange, onBlur, value } }) => (
                              <EuiFieldNumber
                                onChange={onChange}
                                value={value as number}
                                onBlur={onBlur}
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
                            render={({ field: { onChange, onBlur, value } }) => (
                              <EuiDatePicker
                                showTimeSelect
                                selected={value as Moment}
                                onChange={onChange}
                                onBlur={onBlur}
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
                                label=""
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
                            render={({ field: { onChange, onBlur, value } }) => (
                              <EuiDatePicker
                                selected={value as Moment}
                                onChange={onChange}
                                onBlur={onBlur}
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
              </React.Fragment>
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
