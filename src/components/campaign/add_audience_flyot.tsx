import {
  EuiButton,
  EuiButtonIcon,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiSelect,
  EuiSpacer,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import useCreateTemplateAudience from "../../hooks/useCreateTemplateAudience";
import useGetCustomers, { CustomersResponse } from "../../hooks/useGetCustomers";
import useGetSegments, { SegmentResponse } from "../../hooks/useGetSegments";
import { globalMutate } from "../../utils/globalMutate";

const schema = yup
  .object({
    type: yup.string().oneOf(["customer", "segment"]).required(),
    id: yup.string().required(),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const searchSchema = yup
  .object({
    search: yup.string().notRequired(),
  })
  .required();

type SearchFormData = yup.InferType<typeof searchSchema>;

const dataTypeOptions = [
  { value: "customer", text: "Customer" },
  { value: "segment", text: "Segment" },
];

const AddAudienceFlyout = ({ closeFlyout }: { closeFlyout: () => void }) => {
  const router = useRouter();
  const { id } = router.query;
  const { isMutating, trigger } = useCreateTemplateAudience(id);

  const [searchValue, setSearchValue] = useState<any>();
  const { data: customerData, isLoading: isGetCustomersLoading } =
    useGetCustomers<CustomersResponse>(undefined, {
      query: searchValue,
      limit: `${10}`,
    });
  const { data: segmentsData, isLoading: isGetSegmentsLoading } = useGetSegments<SegmentResponse>(
    undefined,
    {
      query: searchValue,
      limit: `${10}`,
    },
  );

  const flyoutHeadingId = useGeneratedHtmlId({
    prefix: "flyoutTitle",
  });

  const preparedCustomerData =
    Array.isArray(customerData?.results) &&
    customerData?.results.map((customer) => ({
      value: customer.id,
      text: customer.email || customer.phone || customer.rid,
    }));

  const preparedSegmentData =
    Array.isArray(segmentsData?.results) &&
    segmentsData?.results.map((segment) => ({
      value: segment.id,
      text: segment.name,
    }));

  const {
    handleSubmit: searchHandleSubmit,
    control: searchControl,
    formState: { errors: searchControlErrors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(searchSchema),
  });

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
    defaultValues: {
      type: "customer",
    },
  });

  const preparedData = watch("type") === "customer" ? preparedCustomerData : preparedSegmentData;

  const onSearch = async (data: SearchFormData) => {
    setSearchValue(data.search);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const response = await trigger(data);
      if (response) {
        globalMutate(`/api/v1/dj/templates/${id}`);
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
        <EuiForm component="form" onSubmit={searchHandleSubmit(onSearch)}>
          <EuiFormRow
            label={`Search ${watch("type") === "customer" ? "customer" : "segment"}`}
            isInvalid={!!searchControlErrors.search?.message}
            error={[searchControlErrors.search?.message]}
          >
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem>
                <Controller
                  control={searchControl}
                  name="search"
                  render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                    <EuiFieldSearch
                      onChange={onChange}
                      value={value}
                      onBlur={onBlur}
                      isInvalid={!!error?.message}
                      aria-label="Search"
                      placeholder={`Search ${
                        watch("type") === "customer" ? "customer" : "segment"
                      }`}
                      isClearable
                    />
                  )}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButtonIcon
                  isLoading={isGetSegmentsLoading || isGetCustomersLoading}
                  display="base"
                  iconType="search"
                  size="s"
                  type="submit"
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFormRow>
        </EuiForm>
        <EuiSpacer size="m" />
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
          <EuiButton isLoading={isMutating} type="submit">
            Add audience
          </EuiButton>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default AddAudienceFlyout;
