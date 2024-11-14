import {
  EuiButton,
  EuiComboBox,
  EuiComboBoxOptionOption,
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
import { SetStateAction, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import useCreateSegmentsAudience from "../../hooks/useCreateSegmentsAudience";
import useGetSegments, { SegmentResponse } from "../../hooks/useGetSegments";
import { globalMutate } from "../../utils/globalMutate";
import { addToast } from "../toast";

const schema = yup
  .object({
    segment: yup
      .array()
      .of(
        yup.object({
          label: yup.string().required(),
          value: yup.string().required("please enter segment"),
        }),
      )
      .required("please enter segment"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const AddSegmentsToAudience = ({
  setIsFlyoutVisible,
}: {
  setIsFlyoutVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const flyoutHeadingId = useGeneratedHtmlId();
  const router = useRouter();
  const { id } = router.query;
  const [searchValue, setSearchValue] = useState<any>();

  const { data: customerSegments, isLoading } = useGetSegments<SegmentResponse>(undefined, {
    query: searchValue,
    limit: `${10}`,
  });

  const dataTypeOptions: EuiComboBoxOptionOption[] =
    customerSegments?.results?.map((segment) => {
      return {
        label: segment?.name,
        value: segment?.id.toString(),
      };
    }) || [];

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { trigger } = useCreateSegmentsAudience(watch("segment")?.[0]?.value);

  const onSearchChange = async (data: string) => {
    setSearchValue(data);
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
        <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
          <EuiFormRow
            label="Search email address, phone and rid"
            isInvalid={!!errors.segment?.message || !!errors.segment?.[0]?.value?.message}
            error={[errors.segment?.message || errors.segment?.[0]?.value?.message]}
          >
            <Controller
              control={control}
              name="segment"
              render={({ field: { value, onBlur, onChange } }) => (
                <EuiComboBox
                  placeholder="Search"
                  singleSelection={{ asPlainText: true }}
                  options={dataTypeOptions}
                  onChange={onChange}
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
            <EuiButton isLoading={isLoading} type="submit">
              Add to segment
            </EuiButton>
          </EuiFormRow>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default AddSegmentsToAudience;
