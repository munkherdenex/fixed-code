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
import React, { SetStateAction, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { mutate } from "swr";
import * as yup from "yup";
import useGetCustomers, { CustomersType } from "../../hooks/useGetCustomers";
import useGetFields, { Fields } from "../../hooks/useGetFields";
import useUpdateCustomer from "../../hooks/useUpdateCustomer";
import { addToast } from "../toast";
import { createCustomerSchema } from "./schema";
import { useTranslations } from "next-intl";

type FormData = yup.InferType<typeof createCustomerSchema>;

const UpdateCustomerComponent = ({
  setIsFlyoutVisible,
}: {
  setIsFlyoutVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const flyoutHeadingId = useGeneratedHtmlId();
  const router = useRouter();
  const translate = useTranslations();

  const { trigger, isMutating } = useUpdateCustomer(router.query.id);
  const { data: detailData, isLoading: getCustomersIsLoading } = useGetCustomers<CustomersType>(
    router.query.id,
    {
      extended: "true",
    },
  );
  const { data: fieldsData, isLoading: getFieldsIsLoading } = useGetFields<Fields[]>(undefined, {
    all: "true",
  });

  const preparedData = fieldsData
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
    resolver: yupResolver(createCustomerSchema),
    defaultValues: {
      email: detailData?.email || undefined,
      phone: +detailData?.phone ? `${+detailData?.phone}` : undefined,
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
        customer_data: data?.customer_data?.reduce((a, v) => ({ ...a, [v.name]: v.value }), {}),
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
            label={translate("email_address")}
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
                  placeholder={translate("email_address")}
                  aria-label={translate("email_address")}
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow
            label={translate("phone_number")}
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
                  placeholder={translate("phone_number")}
                  aria-label={translate("phone_number")}
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow
            label={translate("rid")}
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
                  placeholder={translate("rid")}
                  aria-label={translate("rid")}
                />
              )}
            />
          </EuiFormRow>
          <EuiSpacer />
          <strong>{translate("custom-attributes")}</strong>
          {fieldsData &&
            Array.isArray(fieldsData) &&
            fieldsData.map((field, index) => (
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
            <EuiButton isLoading={isMutating} disabled={isMutating} type="submit">
              {translate("update_audience")}
            </EuiButton>
          </EuiFormRow>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default UpdateCustomerComponent;
