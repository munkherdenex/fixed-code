import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { EuiBadge, EuiComboBox, EuiComboBoxOptionOption, EuiForm, EuiFormRow } from "@elastic/eui";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import useGetCustomers, { CustomersResponse } from "../../hooks/useGetCustomers";
import { PAGINATION_CHOOSES } from "../../constants";

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

const CustomersSelect = ({ isLoading, isDisabled, onSelect, initValue }) => {
  let searchTimeout: NodeJS.Timeout;
  const [searchValue, setSearchValue] = useState("");
  const { data: segmentCustomers } = useGetCustomers<CustomersResponse>(null, {
    phone: searchValue,
    limit: `${PAGINATION_CHOOSES[1]}`,
  });

  const audienceForm = useForm<AudienceFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      customer: [],
    },
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

  useEffect(() => {
    if (segmentCustomers?.results && initValue) {
      const matchingCustomer = segmentCustomers.results.find(
        (customer) => customer.id == initValue,
      );

      if (matchingCustomer) {
        const selectedOption = {
          label: matchingCustomer.email || matchingCustomer.phone || matchingCustomer.rid,
          value: String(matchingCustomer.id),
        };

        // Update the form control value
        audienceForm.setValue("customer", [selectedOption]);
      }
    }
  }, [initValue, segmentCustomers?.results, audienceForm.setValue]);

  const onSearchChange = (value: string) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setSearchValue(value);
    }, 500);
  };

  return (
    <>
      <EuiForm component="form">
        <EuiFormRow
          isInvalid={
            !!audienceForm.formState.errors.customer?.message ||
            !!audienceForm.formState.errors.customer?.[0]?.value?.message
          }
          error={[
            audienceForm.formState.errors.customer?.message ||
              audienceForm.formState.errors.customer?.[0]?.value?.message,
          ]}
        >
          <Controller
            control={audienceForm.control}
            name="customer"
            render={({ field: { value, onBlur, onChange } }) => (
              <EuiComboBox
                placeholder="Search"
                singleSelection={{ asPlainText: true }}
                options={dataTypeOptions}
                onChange={(selected) => {
                  onChange(selected);
                  if (selected.length > 0) {
                    onSelect(selected[0].value);
                  }
                }}
                optionMatcher={({ option, searchValue }) => {
                  return option?.["aria-label"].includes(searchValue);
                }}
                selectedOptions={[{ label: (value && value[0]?.label) || "" }]}
                onBlur={onBlur}
                isClearable={false}
                isLoading={isLoading}
                isDisabled={isDisabled}
                onSearchChange={onSearchChange}
              />
            )}
          />
        </EuiFormRow>
      </EuiForm>
    </>
  );
};

export default CustomersSelect;
