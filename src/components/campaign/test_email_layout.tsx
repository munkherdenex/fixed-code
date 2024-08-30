import {
  EuiButton,
  EuiFieldText,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiTitle,
  useGeneratedHtmlId,
  EuiComboBoxOptionOption,
  EuiComboBox,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { Template } from "../../hooks/useGetTemplates";
import { globalMutate } from "../../utils/globalMutate";
import useTestSend from "../../hooks/useTestSend";
import useGetCustomers, { CustomersResponse } from "../../hooks/useGetCustomers";
import { useState } from "react";
import { addToast } from "../toast";

const schema = yup
  .object({
    worker_emails: yup.string().required().label("Please enter  emails of worker"),
    customer_id: yup.string().required("Please enter audience"),
  })
  .required();

type TestFormData = yup.InferType<typeof schema>;

const TestEmailLayout = ({
  closeFlyout,
  template_data,
}: {
  closeFlyout: () => void;
  template_data: Template;
}) => {
  const { isMutating, trigger } = useTestSend();
  const { data: customers } = useGetCustomers<CustomersResponse>();

  const dataTypeOptions: EuiComboBoxOptionOption[] = customers?.results?.map((customer) => {
    return {
      label: String(customer?.email),
      value: String(customer?.id),
    };
  }) || [{ label: "", value: "" }];

  const [selectedOptions, setSelected] = useState([
    {
      label: "",
    },
  ]);

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
  });

  const onSubmit = async (data: TestFormData) => {
    try {
      const customer_data = customers?.results?.find(
        (value) => value.email === data?.customer_id,
      )?.id;

      const preparedData = {
        ...data,
        customer_id: customer_data,
        template_id: template_data?.id,
      };

      const response = await trigger(preparedData);
      if (response) {
        addToast({
          id: "success",
          title: "Successfully sent",
          color: "success",
        });
        globalMutate("/api/v1/dj/templates/");
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
          <h2>Test send</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
          <EuiFormRow
            label="Customers"
            isInvalid={!!errors.customer_id?.message}
            error={[errors.customer_id?.message]}
          >
            <Controller
              control={control}
              name="customer_id"
              render={({ field: { onBlur, onChange } }) => (
                <EuiComboBox
                  placeholder="Email address"
                  singleSelection={{ asPlainText: true }}
                  options={dataTypeOptions}
                  onChange={(selected) => {
                    setSelected(selected);
                    onChange(selected[0]?.label);
                  }}
                  selectedOptions={selectedOptions}
                  onBlur={onBlur}
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow
            label="Worker emails"
            isInvalid={!!errors.worker_emails?.message}
            error={[errors.worker_emails?.message]}
          >
            <Controller
              control={control}
              name="worker_emails"
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiFieldText
                  onChange={onChange}
                  value={value}
                  onBlur={onBlur}
                  isInvalid={!!errors.worker_emails?.message}
                  placeholder="Email address"
                  aria-label="email"
                />
              )}
            />
          </EuiFormRow>
          <EuiButton isLoading={isMutating} type="submit">
            Sent
          </EuiButton>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default TestEmailLayout;
