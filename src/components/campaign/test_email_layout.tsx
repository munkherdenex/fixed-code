import {
  EuiButton,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFieldText,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import useGetCustomers, { CustomersResponse } from "../../hooks/useGetCustomers";
import { Template } from "../../hooks/useGetTemplates";
import useTestSend from "../../hooks/useTestSend";
import { globalMutate } from "../../utils/globalMutate";
import { addToast } from "../toast";

const schema = yup
  .object({
    worker_emails: yup.string().required().label("Please enter  emails of worker"),
    customer: yup
      .array()
      .of(
        yup
          .object({
            label: yup.string().notRequired(),
            value: yup.string().required("please enter audience"),
          })
          .required("please enter audience"),
      )
      .required("please enter audience"),
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

  const dataTypeOptions: EuiComboBoxOptionOption[] =
    customers?.results?.map((customer) => {
      return {
        label: customer?.email || customer?.phone || customer?.rid,
        value: customer?.id,
      };
    }) || [];

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
      customer: [],
      worker_emails: "",
    },
  });

  const onSubmit = async (data: TestFormData) => {
    try {
      const preparedData = {
        customer_id: data?.customer?.[0]?.value,
        template_id: template_data?.id,
        worker_emails: data?.worker_emails,
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
            isInvalid={!!errors.customer?.message}
            error={[errors.customer?.message]}
          >
            <Controller
              control={control}
              name="customer"
              render={({ field: { onBlur, onChange, value } }) => (
                <EuiComboBox
                  placeholder="Email address"
                  singleSelection={{ asPlainText: true }}
                  options={dataTypeOptions}
                  onChange={(selected) => {
                    onChange([
                      {
                        label: selected?.[0]?.label,
                        value: selected?.[0]?.value,
                      },
                    ]);
                  }}
                  selectedOptions={[{ label: (value && value[0]?.label) || "" }]}
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
            Send
          </EuiButton>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default TestEmailLayout;
