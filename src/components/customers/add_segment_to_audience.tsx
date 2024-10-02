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
  EuiSelectOption,
  EuiSpacer,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { SetStateAction, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import useCreateSegmentsAudience from "../../hooks/useCreateSegmentsAudience";
import useGetSegments, { SegmentResponse } from "../../hooks/useGetSegments";
import { globalMutate } from "../../utils/globalMutate";
import { addToast } from "../toast";

const schema = yup
  .object({
    segment: yup.string().required("please enter segment"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const searchSchema = yup
  .object({
    search: yup.string().notRequired(),
  })
  .required();

type SearchFormData = yup.InferType<typeof searchSchema>;

const AddSegmentsToAudience = ({
  setIsFlyoutVisible,
}: {
  setIsFlyoutVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const flyoutHeadingId = useGeneratedHtmlId();
  const router = useRouter();
  const { id } = router.query;
  const [searchValue, setSearchValue] = useState<any>();

  const { data: customerSegments, isLoading } = useGetSegments<SegmentResponse>(
    undefined,
    {
      query: searchValue,
      limit: `${10}`,
    },
    {
      isFetch: true,
    },
  );

  const dataTypeOptions: EuiSelectOption[] =
    customerSegments?.results?.map((segment) => {
      return {
        text: segment?.name,
        value: segment?.id.toString(),
      };
    }) || [];

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
    formState: { errors },
    watch,
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
    defaultValues: {
      segment: customerSegments?.results[0]?.id.toString() || "",
    },
  });

  const { trigger } = useCreateSegmentsAudience(watch("segment"));

  const onSearch = async (data: SearchFormData) => {
    setSearchValue(data?.search);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const prepareData = {
        ...data,
        customer: +id,
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
        globalMutate(`/api/v1/dj/segments/${data?.segment}/customers/`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <EuiFlyout onClose={() => setIsFlyoutVisible(false)}>
      <EuiFlyoutHeader hasBorder aria-labelledby={flyoutHeadingId}>
        <EuiTitle>
          <h2 id={flyoutHeadingId}>Add to segment</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" onSubmit={searchHandleSubmit(onSearch)}>
          <EuiFormRow
            label={`Search segment`}
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
                      placeholder={`Search segment`}
                      isClearable
                    />
                  )}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButtonIcon
                  isLoading={isLoading}
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
            label="Segment"
            isInvalid={!!errors.segment?.message}
            error={[errors.segment?.message]}
          >
            <Controller
              control={control}
              name="segment"
              render={({ field: { onBlur, onChange, value } }) => (
                <EuiSelect
                  options={dataTypeOptions}
                  onChange={(selected) => {
                    onChange(selected);
                  }}
                  value={value}
                  onBlur={onBlur}
                  hasNoInitialSelection
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow hasEmptyLabelSpace>
            <EuiButton type="submit">Add to segment</EuiButton>
          </EuiFormRow>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default AddSegmentsToAudience;
