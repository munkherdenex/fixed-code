import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiPanel,
  EuiRadioGroup,
  EuiSpacer,
  EuiText,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import Wrapper from "../../components/starter/wrapper";
import { addToast } from "../../components/toast";
import useUnsubscribe from "../../hooks/useUnsubscribe";

const schema = yup.object({
  reason: yup.string().required().label("Reason"),
});

type FormData = yup.InferType<typeof schema>;

const Unsubscribe = () => {
  const { isMutating, trigger } = useUnsubscribe();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
  });

  const radioGroupItemId__1 = useGeneratedHtmlId({
    prefix: "radioGroupItem",
    suffix: "first",
  });
  const radioGroupItemId__2 = useGeneratedHtmlId({
    prefix: "radioGroupItem",
    suffix: "second",
  });
  const radioGroupItemId__3 = useGeneratedHtmlId({
    prefix: "radioGroupItem",
    suffix: "third",
  });
  const radioGroupItemId__4 = useGeneratedHtmlId({
    prefix: "radioGroupItem",
    suffix: "fourth",
  });
  const radioGroupItemId__5 = useGeneratedHtmlId({
    prefix: "radioGroupItem",
    suffix: "fifth",
  });
  const radioGroupItemId__6 = useGeneratedHtmlId({
    prefix: "radioGroupItem",
    suffix: "sixth",
  });

  const radios = [
    {
      id: radioGroupItemId__1,
      label: "Content no longer revelant",
    },
    {
      id: radioGroupItemId__2,
      label: "Frequency of emails is too high",
    },
    {
      id: radioGroupItemId__3,
      label: "Cleaning up my inbox",
    },
    {
      id: radioGroupItemId__4,
      label: "Changing email address",
    },
    {
      id: radioGroupItemId__5,
      label: "I never signed up for this",
    },
    {
      id: radioGroupItemId__6,
      label: "Others",
    },
  ];

  const onSubmit = (data: FormData) => {
    console.log(data);
    console.log(radios.find((radio) => radio.id === data.reason).label);
    // const response = trigger({
    //   reason: radios.find((radio) => radio.id === data.reason).label,
    // });
    // if (response) {
    //   addToast({
    //     id: "unsubscribe",
    //     title: "Unsubscribe",
    //     color: "danger",
    //     message: "Failed to unsubscribe.",
    //   });
    // }
  };

  return (
    <Wrapper>
      <EuiSpacer size="xl" />
      <EuiFlexGroup justifyContent="center" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiPanel>
            <EuiText>
              <h1>Unsubscribe</h1>
            </EuiText>
            <EuiSpacer size="l" />
            <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
              <EuiFormRow isInvalid={!!errors.reason?.message} error={[errors.reason?.message]}>
                <Controller
                  control={control}
                  name="reason"
                  render={({ field: { onChange, onBlur, value, name } }) => (
                    <EuiRadioGroup
                      options={radios}
                      onBlur={onBlur}
                      idSelected={value}
                      onChange={onChange}
                      name={name}
                      legend={{
                        children: <span>Please let us know why you are unsubscribing</span>,
                      }}
                    />
                  )}
                />
              </EuiFormRow>
              <EuiFormRow>
                <EuiButton isLoading={isMutating} type="submit">
                  Unsubscribe
                </EuiButton>
              </EuiFormRow>
            </EuiForm>
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    </Wrapper>
  );
};

export default Unsubscribe;
