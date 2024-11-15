import {
  EuiButton,
  EuiComboBox,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { memo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import useCreateTemplateAudience from "../../hooks/useCreateTemplateAudience";
import useGetCustomers, { CustomersResponse } from "../../hooks/useGetCustomers";
import useGetSegments, { SegmentResponse } from "../../hooks/useGetSegments";
import { globalMutate } from "../../utils/globalMutate";

const schema = yup
  .object({
    type: yup.string().oneOf(["customer", "segment"]).required(),
    id: yup
      .array()
      .of(
        yup.object({
          value: yup.string().required(),
          label: yup.string().required(),
        }),
      )
      .required(),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const LIMIT = `10`;

const AddAudienceFlyout = ({
  closeFlyout,
  dataType,
}: {
  closeFlyout: () => void;
  dataType: FormData["type"];
}) => {
  let searchTimeout: NodeJS.Timeout;

  const router = useRouter();
  const { id } = router.query;
  const { isMutating, trigger } = useCreateTemplateAudience(id);
  const flyoutHeadingId = useGeneratedHtmlId({
    prefix: "flyoutTitle",
  });

  const [searchValue, setSearchValue] = useState<string>("");

  const { data: customerData, isLoading: isGetCustomersLoading } =
    useGetCustomers<CustomersResponse>(
      undefined,
      {
        query: searchValue,
        limit: LIMIT,
      },
      {
        isFetch: dataType === "customer" ? true : false,
      },
    );

  const { data: segmentsData, isLoading: isGetSegmentsLoading } = useGetSegments<SegmentResponse>(
    undefined,
    {
      query: searchValue,
      limit: LIMIT,
    },
    {
      isFetch: dataType === "segment" ? true : false,
    },
  );

  const preparedCustomerData =
    Array.isArray(customerData?.results) &&
    customerData?.results.map((customer) => ({
      value: customer?.id,
      label: customer?.email || customer?.phone || customer?.rid,
    }));

  const preparedSegmentData =
    Array.isArray(segmentsData?.results) &&
    segmentsData?.results.map((segment) => ({
      value: segment?.id,
      label: segment?.name,
    }));

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: dataType,
    },
  });

  const preparedData = watch("type") === "customer" ? preparedCustomerData : preparedSegmentData;

  const onSearch = async (data: string) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setSearchValue(data);
    }, 250);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const preparedData = {
        type: data.type,
        id: data?.id?.[0]?.value,
      };
      const response = await trigger(preparedData);
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
        <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
          <EuiFormRow label="Ids" isInvalid={!!errors.id?.message} error={[errors.id?.message]}>
            <Controller
              control={control}
              name="id"
              render={({ field: { onChange, onBlur, value } }) => (
                <EuiComboBox
                  onChange={onChange}
                  options={preparedData || []}
                  selectedOptions={value?.[0]?.label ? [{ label: value?.[0]?.label }] : []}
                  onBlur={onBlur}
                  isInvalid={!!errors.type?.message}
                  onSearchChange={onSearch}
                  isLoading={isMutating || isGetCustomersLoading || isGetSegmentsLoading}
                  aria-label="data type"
                  singleSelection
                />
              )}
            />
          </EuiFormRow>
          <EuiButton
            disabled={isMutating || isGetCustomersLoading || isGetSegmentsLoading}
            isLoading={isMutating || isGetCustomersLoading || isGetSegmentsLoading}
            type="submit"
          >
            Add audience
          </EuiButton>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default memo(AddAudienceFlyout);
