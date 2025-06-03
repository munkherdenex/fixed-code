import {
  EuiBadge,
  EuiButton,
  EuiComboBox,
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
import { memo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import useCreateTemplateAudience from "../../hooks/useCreateTemplateAudience";
import useGetCustomers, { CustomersResponse } from "../../hooks/useGetCustomers";
import useGetSegments, { SegmentResponse } from "../../hooks/useGetSegments";
import { globalMutate } from "../../utils/globalMutate";
import { useTranslations } from "next-intl";

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
  const translate = useTranslations();
  const flyoutHeadingId = useGeneratedHtmlId({
    prefix: "flyoutTitle",
  });
  const { isMutating, trigger } = useCreateTemplateAudience(id);

  const [searchValue, setSearchValue] = useState<string>("");

  const searchTypeOptions = [
    { value: "phone", text: "Утсаар хайх" },
    { value: "email", text: "И-мейлээр хайх" },
  ];

  const [searchType, setSearchType] = useState(searchTypeOptions[0].value);

  const basicSelectId = useGeneratedHtmlId({ prefix: "basicSelect" });

  const onSearchTypeChange = (e) => {
    setSearchType(e.target.value);
  };

  const { data: customerData, isLoading: isGetCustomersLoading } =
    useGetCustomers<CustomersResponse>(
      undefined,
      {
        [searchType === "phone" ? "phone" : "email"]: searchValue,
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
      "aria-label": `${customer?.email} ${customer?.phone} ${customer?.rid}`,
      label: customer?.email || customer?.phone || customer?.rid,
      append: <EuiBadge>{customer?.phone || customer?.email || customer?.rid}</EuiBadge>,
    }));

  const preparedSegmentData =
    Array.isArray(segmentsData?.results) &&
    segmentsData?.results.map((segment) => ({
      value: segment?.id,
      "aria-label": `${segment?.name}`,
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
    }, 500);
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
          <h2>{translate("add_audience")}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFormRow
                label={translate("rid")}
                isInvalid={!!errors.id?.message}
                error={[errors.id?.message]}
              >
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
                      optionMatcher={({ option, searchValue }) => {
                        return option?.["aria-label"].includes(searchValue);
                      }}
                      aria-label={translate("data_type")}
                      singleSelection
                    />
                  )}
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiFormRow
                label="Хайх төрөл"
                isInvalid={!!errors.id?.message}
                error={[errors.id?.message]}
              >
                <EuiSelect
                  id={basicSelectId}
                  options={searchTypeOptions}
                  value={searchType}
                  onChange={(e) => onSearchTypeChange(e)}
                  aria-label="Use aria labels when no actual label is in use"
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="s" />
          <EuiButton
            disabled={isMutating || isGetCustomersLoading || isGetSegmentsLoading}
            isLoading={isMutating || isGetCustomersLoading || isGetSegmentsLoading}
            type="submit"
          >
            {translate("add_audience")}
          </EuiButton>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default memo(AddAudienceFlyout);
