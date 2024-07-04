import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiPagination,
  EuiSelect,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { mutate } from "swr";
import * as yup from "yup";
import useCreateTemplateAudience from "../../hooks/useCreateTemplateAudience";
import useGetCustomers, { CustomersResponse } from "../../hooks/useGetCustomers";
import useGetSegments, { SegmentResponse } from "../../hooks/useGetSegments";

const PAGE_COUNT = 15;

const schema = yup
  .object({
    type: yup.string().oneOf(["customer", "segment"]).required(),
    id: yup.string().required(),
  })
  .required();

const dataTypeOptions = [
  { value: "customer", text: "Customer" },
  { value: "segment", text: "Segment" },
];

type FormData = yup.InferType<typeof schema>;

const AddAudienceFlyout = ({ closeFlyout }: { closeFlyout: () => void }) => {
  const router = useRouter();
  const { id } = router.query;
  const { isMutating, trigger } = useCreateTemplateAudience(id);
  const { data: customerData } = useGetCustomers<CustomersResponse>();
  const { data: segmentsData } = useGetSegments<SegmentResponse>();
  const [activePage, setActivePage] = useState(0);

  const flyoutHeadingId = useGeneratedHtmlId({
    prefix: "flyoutTitle",
  });

  const preparedCustomerData =
    Array.isArray(customerData?.results) &&
    customerData?.results.map((customer) => ({
      value: customer.id,
      text: customer.email,
    }));

  const preparedSegmentData =
    Array.isArray(segmentsData?.results) &&
    segmentsData?.results.map((segment) => ({
      value: segment.id,
      text: segment.name,
    }));

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: "customer",
    },
  });

  const preparedData = watch("type") === "customer" ? preparedCustomerData : preparedSegmentData;

  const onSubmit = async (data: FormData) => {
    try {
      const response = await trigger(data);
      if (response) {
        mutate(`/api/v1/dj/templates/${id}/customers/`);
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
          <h2>Add audience</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
          <EuiFormRow
            label="Data type"
            isInvalid={!!errors.type?.message}
            error={[errors.type?.message]}
          >
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiSelect
                  onChange={onChange}
                  value={value}
                  options={dataTypeOptions}
                  onBlur={onBlur}
                  isInvalid={!!errors.type?.message}
                  aria-label="data type"
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow label="Ids" isInvalid={!!errors.id?.message} error={[errors.id?.message]}>
            <Controller
              control={control}
              name="id"
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiSelect
                  onChange={onChange}
                  value={value}
                  options={preparedData || []}
                  onBlur={onBlur}
                  isInvalid={!!errors.type?.message}
                  aria-label="data type"
                  hasNoInitialSelection
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow>
            <EuiFlexGroup justifyContent="spaceAround">
              <EuiFlexItem grow={false}>
                <EuiPagination
                  aria-label="Centered pagination example"
                  pageCount={PAGE_COUNT / 5}
                  activePage={activePage}
                  onPageClick={(activePage) => setActivePage(activePage)}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFormRow>
          <EuiButton isLoading={isMutating} type="submit">
            Add audience
          </EuiButton>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default AddAudienceFlyout;
