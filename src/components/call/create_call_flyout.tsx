import {
  EuiButton,
  EuiDatePicker,
  EuiFieldText,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiSelect,
  EuiSpacer,
  EuiTitle,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { Moment } from "moment";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

const statusOptions = [
  { value: "ended", text: "ended" },
  { value: "answered", text: "answered" },
  { value: "talking", text: "talking" },
];

const schema = yup
  .object({
    phone: yup.string().email().required(),
    date: yup.mixed().required(),
    status: yup.string(),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const CreateCallFlyout = () => {
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  function onSubmit(data: FormData) {
    console.log(data);
  }

  return (
    <div>
      <EuiButton onClick={() => setIsFlyoutVisible(true)}>Add call</EuiButton>
      {isFlyoutVisible && (
        <EuiFlyout ownFocus onClose={() => setIsFlyoutVisible(false)}>
          <EuiFlyoutHeader hasBorder>
            <EuiTitle size="m">
              <h2>Add call</h2>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
              <EuiFormRow
                label="Phone"
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
                      placeholder="Email"
                      aria-label="email"
                    />
                  )}
                />
              </EuiFormRow>
              <EuiFormRow
                label="Date"
                isInvalid={!!errors.date?.message}
                error={[errors.date?.message]}
              >
                <Controller
                  control={control}
                  name="date"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <EuiDatePicker
                      showTimeSelect
                      selected={value as Moment}
                      onChange={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </EuiFormRow>
              <EuiFormRow
                label="Status"
                isInvalid={!!errors.date?.message}
                error={[errors.date?.message]}
              >
                <Controller
                  control={control}
                  name="status"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <EuiSelect
                      hasNoInitialSelection
                      options={statusOptions}
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                    />
                  )}
                />
              </EuiFormRow>
              <EuiSpacer size="m" />
              <EuiButton type="submit" fill>
                Create
              </EuiButton>
            </EuiForm>
          </EuiFlyoutBody>
        </EuiFlyout>
      )}
    </div>
  );
};

export default CreateCallFlyout;
