import {
  useGeneratedHtmlId,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiTitle,
  EuiFlyoutBody,
  EuiForm,
  EuiFormRow,
  EuiButton,
  EuiComboBox,
  EuiComboBoxOptionOption,
} from "@elastic/eui";
import { SetStateAction, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { addToast } from "../toast";
import { globalMutate } from "../../utils/globalMutate";
import useCreateSegmentsAudience from "../../hooks/useCreateSegmentsAudience";
import { useRouter } from "next/router";
import useGetCustomers, { CustomersResponse } from "../../hooks/useGetCustomers";

const schema = yup
  .object({
    customer: yup.string().required("please enter audience"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const CreateAudienceSegment = ({
  setIsFlyoutVisible,
}: {
  setIsFlyoutVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const flyoutHeadingId = useGeneratedHtmlId();
  const router = useRouter();
  const { id } = router.query;
  const { trigger } = useCreateSegmentsAudience(id);
  const { data: segmentCustomers } = useGetCustomers<CustomersResponse>();
  const dataTypeOptions: EuiComboBoxOptionOption[] = segmentCustomers?.results?.map((customer) => {
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

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
    defaultValues: {
      customer: segmentCustomers?.results[0]?.id.toString() || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const customer_data = segmentCustomers?.results?.find(
        (value) => value.email === data?.customer,
      )?.id;
      const prepareData = {
        customer: customer_data,
        segment: id,
      };
      const response = await trigger(prepareData);
      if (response) {
        setIsFlyoutVisible(false);
        addToast({
          id: "segment-audience-success",
          color: "success",
          title: "Success",
          text: "Successfully register",
        });
        globalMutate(`/api/v1/dj/segments/${id}/customers/`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <EuiFlyout onClose={() => setIsFlyoutVisible(false)}>
      <EuiFlyoutHeader hasBorder aria-labelledby={flyoutHeadingId}>
        <EuiTitle>
          <h2 id={flyoutHeadingId}>Add audience</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
          <EuiFormRow
            label="Email address"
            isInvalid={!!errors.customer?.message}
            error={[errors.customer?.message]}
          >
            <Controller
              control={control}
              name="customer"
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
          <EuiFormRow hasEmptyLabelSpace>
            <EuiButton type="submit">Add audience</EuiButton>
          </EuiFormRow>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default CreateAudienceSegment;
