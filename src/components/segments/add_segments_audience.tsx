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
  EuiBadge,
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
import { PAGINATION_CHOOSES } from "../../constants";
import { useTranslations } from "next-intl";

const schema = yup
  .object({
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

type AudienceFormData = yup.InferType<typeof schema>;

const CreateAudienceSegment = ({
  setIsFlyoutVisible,
}: {
  setIsFlyoutVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  let searchTimeout: NodeJS.Timeout;

  const flyoutHeadingId = useGeneratedHtmlId();
  const router = useRouter();
  const { id } = router.query;
  const translate = useTranslations();

  const { trigger, isMutating } = useCreateSegmentsAudience(id);

  const [searchValue, setSearchValue] = useState("");

  const { data: segmentCustomers, isLoading } = useGetCustomers<CustomersResponse>(null, {
    query: searchValue,
    limit: `${PAGINATION_CHOOSES[1]}`,
  });

  const dataTypeOptions: EuiComboBoxOptionOption[] =
    segmentCustomers?.results?.map((customer) => {
      return {
        label: customer?.email || customer?.phone || customer?.rid,
        "aria-label": `${customer?.email} ${customer?.phone} ${customer?.rid}`,
        value: String(customer?.id),
        append: <EuiBadge>{customer?.phone || customer?.email || customer?.rid}</EuiBadge>,
      };
    }) || [];

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSearchChange = (value: string) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setSearchValue(value);
    }, 500);
  };

  const onSubmit = async (data: AudienceFormData) => {
    try {
      if (data?.customer[0]?.value) {
        const prepareData = {
          customer: data?.customer[0]?.value,
          segment: id,
        };
        const response = await trigger(prepareData);
        if (response) {
          setIsFlyoutVisible(false);
          addToast({
            id: "segment-audience-success",
            color: "success",
            title: "Success",
            text: "Audience added to the segment.",
          });
          globalMutate(`/api/v1/dj/segments/${id}/customers/`);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <EuiFlyout onClose={() => setIsFlyoutVisible(false)}>
      <EuiFlyoutHeader hasBorder aria-labelledby={flyoutHeadingId}>
        <EuiTitle>
          <h2 id={flyoutHeadingId}>{translate("add_audience")}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
          <EuiFormRow
            label={translate("search_email_address_phone_rid")}
            isInvalid={!!errors.customer?.message || !!errors.customer?.[0]?.value?.message}
            error={[errors.customer?.message || errors.customer?.[0]?.value?.message]}
          >
            <Controller
              control={control}
              name="customer"
              render={({ field: { value, onBlur, onChange } }) => (
                <EuiComboBox
                  placeholder="Search"
                  singleSelection={{ asPlainText: true }}
                  options={dataTypeOptions}
                  onChange={(selected) => {
                    onChange(selected);
                  }}
                  optionMatcher={({ option, searchValue }) => {
                    return option?.["aria-label"].includes(searchValue);
                  }}
                  selectedOptions={[{ label: (value && value[0]?.label) || "" }]}
                  onSearchChange={onSearchChange}
                  onBlur={onBlur}
                  isClearable={false}
                  isLoading={isLoading}
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow hasEmptyLabelSpace>
            <EuiButton isLoading={isMutating} disabled={isMutating} type="submit">
              {translate("add_audience")}
            </EuiButton>
          </EuiFormRow>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default CreateAudienceSegment;
