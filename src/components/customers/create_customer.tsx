import {
  useGeneratedHtmlId,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiTitle,
  EuiFlyoutBody,
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFieldText,
  EuiFieldNumber,
  EuiButton,
} from "@elastic/eui";
import { SetStateAction, useContext } from "react";
import useCreateCustomer from "../../hooks/useCreateCustomer";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { addToast } from "../toast";

const schema = yup
  .object({
    email: yup.string().email().required("please enter your email address"),
    phone: yup.number().min(6).required("please enter your phone"),
    rid: yup.string().required("please enter your registration"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const CreateCustomerComponent = ({
  setIsFlyoutVisible,
}: {
  setIsFlyoutVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const flyoutHeadingId = useGeneratedHtmlId();
  const { trigger } = useCreateCustomer<FormData>();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await trigger(data);
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
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
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
            </EuiFlexItem>
            <EuiFlexItem>
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
            </EuiFlexItem>
            <EuiFlexItem>
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
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiFormRow hasEmptyLabelSpace>
                <EuiButton type="submit">Create customer</EuiButton>
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default CreateCustomerComponent;
