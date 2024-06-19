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
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { addToast } from "../toast";
import useUpdateCustomer from "../../hooks/useUpdateCustomer";
import useGetCustomers from "../../hooks/useGetCustomers";
import { useRouter } from "next/router";

const schema = yup
  .object({
    email: yup.string().email().required("please enter your email address"),
    phone: yup.number().min(6).required("please enter your phone"),
    rid: yup.string().required("please enter your registration"),
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
  const { trigger } = useUpdateCustomer<FormData>(router.query.id);
  const { detailData } = useGetCustomers(router.query.id);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: detailData?.email || '',
      phone: Number(detailData?.phone) || 0,
      rid: detailData.rid || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      console.log(data);
      const response = await trigger(data);
      if (response) {
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

  return (
    <EuiFlyout onClose={() => setIsFlyoutVisible(false)}>
      <EuiFlyoutHeader hasBorder aria-labelledby={flyoutHeadingId}>
        <EuiTitle>
          <h2 id={flyoutHeadingId}>Update customer</h2>
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
                label="Rid"
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
                      placeholder="Rid"
                      aria-label="rid"
                    />
                  )}
                />
              </EuiFormRow>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiFormRow hasEmptyLabelSpace>
                <EuiButton type="submit">Update customer</EuiButton>
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default UpdateCustomerComponent;
