import {
  useGeneratedHtmlId,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiTitle,
  EuiFlyoutBody,
  EuiForm,
  EuiFormRow,
  EuiButton,
  EuiSelect,
  EuiSelectOption,
} from "@elastic/eui";
import { SetStateAction } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { addToast } from "../toast";
import { globalMutate } from "../../utils/globalMutate";
import useCreateSegmentsAudience from "../../hooks/useCreateSegmentsAudience";
import { useRouter } from "next/router";
import useGetSegments, { SegmentResponse } from "../../hooks/useGetSegments";

const schema = yup
  .object({
    segment: yup.string().required("please enter segment"),
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

  const { trigger } = useCreateSegmentsAudience(id);
  const { data: customerSegments } = useGetSegments<SegmentResponse>();

  const dataTypeOptions: EuiSelectOption[] =
    customerSegments?.results?.map((segment) => {
      return {
        text: segment?.name,
        value: segment?.id.toString(),
      };
    }) || [];

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
    defaultValues: {
      segment: customerSegments?.results[0]?.id.toString() || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const prepareData = {
        ...data,
        customer: id,
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
          <h2 id={flyoutHeadingId}>Add segment</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
          <EuiFormRow
            label="Segment Ids"
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
                />
              )}
            />
          </EuiFormRow>
          <EuiFormRow hasEmptyLabelSpace>
            <EuiButton type="submit">Add segment</EuiButton>
          </EuiFormRow>
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export default AddSegmentsToAudience;
