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
import { createCustomerSchema } from "./schema";
import { useTranslations } from "next-intl";

type FormData = yup.InferType<typeof createCustomerSchema>;

const CreateCustomerComponent = ({
  setIsFlyoutVisible,
}: {
  setIsFlyoutVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const flyoutHeadingId = useGeneratedHtmlId();
  const translate = useTranslations();
  const { trigger, isMutating } = useCreateCustomer();
  const { data } = useGetFields<FieldsResponse>(null, { limit: '100' });
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(createCustomerSchema),
    defaultValues: {
      customer_data: [],
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const preparedData = {
        ...data,
        customer_data: data?.customer_data?.reduce((a, v) => ({ ...a, [v.name]: v.value }), {}),
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
          <h2 id={flyoutHeadingId}>{translate("create-audience")}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
          <EuiFormRow
            label={translate("email")}
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
                  placeholder={translate("email")}
                  aria-label="email"
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow
            label={translate("phone")}
            isInvalid={!!errors.phone?.message}
            error={[errors.phone?.message]}
          >
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiFieldNumber
                  onChange={(event) => {
                    if (event.target.value === "" || event.target.value === null) {
                      return onChange(undefined);
                    }
                    onChange(+event.target.value);
                  }}
                  value={value}
                  onBlur={onBlur}
                  placeholder={translate("phone")}
                  aria-label="phone"
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow
            label={translate("rid")}
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
                  placeholder={translate("rid")}
                  aria-label="rid"
                />
              )}
            />
          </EuiFormRow>
          <EuiSpacer />
          <strong>{translate("custom-attributes")}</strong>
          {data?.results &&
            Array.isArray(data?.results) &&
            data?.results.map((field, index) => (
              <>
                <EuiSpacer size="s" />
                <EuiFlexGrid key={field.id} columns={2}>
                  <EuiFlexItem style={{ visibility: "hidden", display: "none" }}>
                    <EuiFormRow label={`${field.name} (${field.data_type})`}>
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
            <EuiButton isLoading={isMutating} disabled={isMutating} type="submit">
              {translate("create-audience")}
            </EuiButton>
          </EuiFormRow>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default CreateCustomerComponent;
