import {
  EuiButton,
  EuiButtonGroup,
  EuiDatePicker,
  EuiFieldNumber,
  EuiFlexGrid,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiSelect,
  EuiSpacer,
  EuiSwitch,
} from "@elastic/eui";
import { yupResolver } from "@hookform/resolvers/yup";
import moment, { Moment } from "moment";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import useCreateReccurenceRule from "../../hooks/useUpdateReccurenceRule";
import { useCampaignContext } from "../../store/campaign_store";
import { commonStyles } from "../../styles/global.styles";
import { globalMutate } from "../../utils/globalMutate";
import { extendWeekDays, getMonthDays, isNumber, shorthenWeekDays } from "../../utils/helper";
import { addToast } from "../toast";

const repeatOptions = [
  { value: "hourly", text: "Hourly" },
  { value: "daily", text: "Daily" },
  { value: "weekly", text: "Weekly" },
  { value: "monthly", text: "Monthly" },
  { value: "yearly", text: "Yearly" },
];

const endOptions = [
  { value: "never", text: "Never" },
  { value: "after", text: "After" },
  { value: "on", text: "On" },
];

const toggleButtonsMulti = [
  {
    id: "monday",
    label: "Mon",
  },
  {
    id: "tuesday",
    label: "Tues",
  },
  {
    id: "wednesday",
    label: "Wed",
  },
  {
    id: "thursday",
    label: "Thurs",
  },
  {
    id: "friday",
    label: "Fri",
  },
  {
    id: "saturday",
    label: "Sat",
  },
  {
    id: "sunday",
    label: "Sun",
  },
];

const schema = yup.object({
  start_date: yup.mixed<Moment>().required().label("Start date"),
  is_recurring: yup.boolean().required(),
  repeat: yup.string().when(["is_recurring"], ([is_recurring], schema) => {
    if (is_recurring) {
      return schema.required();
    }

    return schema.notRequired();
  }),
  interval: yup.number().when(["repeat", "is_recurring"], ([repeat, is_recurring], schema) => {
    if (repeat && is_recurring) {
      return schema.required();
    }

    return schema.notRequired();
  }),
  weekDays: yup
    .array()
    .of(yup.string())
    .when(["repeat", "is_recurring"], ([repeat, is_recurring], schema) => {
      if (repeat === "weekly" && is_recurring) {
        return schema.required();
      }

      return schema.notRequired();
    }),
  selectedDays: yup
    .array()
    .of(yup.mixed<Moment>())
    .when(["repeat", "is_recurring"], ([repeat, is_recurring], schema) => {
      if (repeat === "monthly" && is_recurring) {
        return schema.required();
      }

      return schema.notRequired();
    }),
  end: yup.string().when(["is_recurring"], ([is_recurring], schema) => {
    if (is_recurring) {
      return schema.required();
    }

    return schema.notRequired();
  }),
  recur_count: yup.number().when(["end"], ([end], schema) => {
    if (end === "after") {
      return schema.required();
    }

    return schema.notRequired();
  }),
  end_date: yup
    .mixed<Moment>()
    .when(["end"], ([end], schema) => {
      if (end === "on") {
        return schema.required();
      }

      return schema.notRequired();
    })
    .label("On"),
});

type FormData = yup.InferType<typeof schema>;
const dateYear = 2022;

const ReccurenceRule = ({
  setIsFlyoutVisible,
}: {
  setIsFlyoutVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { data } = useCampaignContext();
  const { trigger, isMutating } = useCreateReccurenceRule(data?.id);
  const cStyles = commonStyles();

  const isDraft = useMemo(() => data?.status === "DRAFT", [data?.status]);

  const startDate = useMemo(
    () => (data?.start_date ? moment(data?.start_date) : moment()),
    [data?.start_date],
  );
  const endDate = useMemo(
    () => (data?.end_date ? moment(data?.end_date) : startDate),
    [data?.end_date, startDate],
  );
  const end = useMemo(
    () => (data?.recur_count ? "after" : data?.end_date ? "on" : "never"),
    [data?.end_date, data?.recur_count],
  );
  const repeat = useMemo(
    () => data?.recur_rule?.FREQ?.toLowerCase() || "daily",
    [data?.recur_rule],
  );
  const interval = useMemo(
    () => (isNumber(data?.recur_rule?.INTERVAL) ? +data?.recur_rule?.INTERVAL : 1),
    [data?.recur_rule?.INTERVAL],
  );
  const weekDays = useMemo(
    () => extendWeekDays(data?.recur_rule?.BYDAY) || ["monday"],
    [data?.recur_rule?.BYDAY],
  );
  const recurCount = useMemo(
    () => (isNumber(data?.recur_count) ? +data?.recur_count : 1),
    [data?.recur_count],
  );
  const isRecurring = useMemo(() => data?.is_recurring || false, [data?.is_recurring]);

  const {
    handleSubmit,
    control,
    watch,
    resetField,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      start_date: startDate,
      is_recurring: isRecurring,
      repeat: repeat,
      interval: interval,
      end: end,
      weekDays: weekDays,
      recur_count: recurCount,
      end_date: endDate,
      selectedDays: [],
    },
  });

  const onSubmit = async (data: FormData) => {
    const prependedData = {
      start_date: data?.start_date,
      is_recurring: data?.is_recurring,
      recur_count: data?.end === "after" ? data?.recur_count : null,
      end_date: data?.end === "on" ? data?.end_date : null,
      recur_rule: "",
    };

    // let endRule = {};
    //
    // if (data?.end === "after") {
    //   endRule = {
    //     count: data?.recur_count,
    //   };
    // }
    //
    // if (data?.end === "on") {
    //   endRule = {
    //     until: datetime(
    //       data?.end_date?.year(),
    //       data?.end_date?.month(),
    //       data?.end_date?.date(),
    //       data?.end_date?.hour(),
    //       data?.end_date?.minute(),
    //     ),
    //   };
    // }
    //
    // const rule = new RRule({
    //   interval: data?.interval,
    //   freq: rruleFreqSwitch(data?.repeat),
    //   byweekday: rruleWeekDaySwitch(data?.weekDays),
    //   bymonthday: getMonthDays(data?.selectedDays),
    //   ...endRule,
    // });

    const rruleJson = {
      freq: data?.repeat.toUpperCase(),
      interval: data?.interval.toString(),
      bymonthday: getMonthDays(data?.selectedDays),
      byday: shorthenWeekDays(data?.weekDays),
    };

    try {
      const response = await trigger({
        ...prependedData,
        recur_rule: rruleJson,
      });
      if (response) {
        globalMutate("templates");
        setIsFlyoutVisible(false);
        addToast({
          id: "reccurence-rule",
          title: "Success",
          color: "success",
          iconType: "check",
          text: "Reccurence rule updated successfully",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (watch("repeat") === "monthly") {
      setValue(
        "selectedDays",
        Array.isArray(data?.recur_rule?.BYMONTHDAY)
          ? data?.recur_rule?.BYMONTHDAY?.map((d) => moment().year(dateYear).month(12).date(d))
          : [moment().year(dateYear).month(12)],
      );
    }
    if (watch("repeat") === "weekly") {
      setValue("weekDays", extendWeekDays(data?.recur_rule?.BYDAY) || ["monday"]);
    }
    if (watch("repeat") !== "monthly") {
      resetField("selectedDays");
    }
    if (watch("repeat") !== "weekly") {
      resetField("weekDays");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("repeat")]);

  useEffect(() => {
    resetField("end_date");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("start_date")]);

  return (
    <EuiForm component="form" onSubmit={handleSubmit(onSubmit)}>
      <EuiFormRow
        label="Start date"
        isInvalid={!!errors.start_date?.message}
        error={[errors.start_date?.message]}
      >
        <Controller
          control={control}
          name="start_date"
          render={({ field: { onChange, onBlur, value, name } }) => (
            <EuiDatePicker
              minDate={moment()}
              showTimeSelect
              selected={value as Moment}
              onChange={onChange}
              onBlur={onBlur}
              placeholder={name}
              readOnly={!isDraft}
            />
          )}
        />
      </EuiFormRow>
      <EuiSpacer size="m" />
      <EuiFormRow>
        <Controller
          control={control}
          name="is_recurring"
          render={({ field: { value, onChange } }) => (
            <EuiSwitch
              label="Enable reccurence"
              checked={value}
              disabled={!isDraft}
              onChange={(e) => onChange(e.target.checked)}
            />
          )}
        />
      </EuiFormRow>
      {watch("is_recurring") && (
        <>
          <EuiSpacer size="m" />
          <EuiFlexGrid columns={2} gutterSize="s" alignItems="start">
            <EuiFlexItem>
              <EuiFormRow isInvalid={!!errors.interval?.message} error={[errors.interval?.message]}>
                <Controller
                  control={control}
                  name="interval"
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <EuiFieldNumber
                      prepend="Repeat every"
                      value={value}
                      onChange={onChange}
                      onBlur={onBlur}
                      inputRef={ref}
                      readOnly={!isDraft}
                    />
                  )}
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormRow isInvalid={!!errors.repeat?.message} error={[errors.repeat?.message]}>
                <Controller
                  control={control}
                  name="repeat"
                  render={({ field }) => (
                    <EuiSelect {...field} options={repeatOptions} disabled={!isDraft} />
                  )}
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem grow={2}>
              {watch("repeat") === "weekly" && (
                <EuiFormRow
                  isInvalid={!!errors.weekDays?.message}
                  error={[errors.weekDays?.message]}
                >
                  <Controller
                    control={control}
                    name="weekDays"
                    render={({ field: { onChange, value } }) => {
                      const selectedMap = value?.reduce<{ [id: string]: boolean }>(
                        (a: { [id: string]: boolean }, v): { [id: string]: boolean } => ({
                          ...a,
                          [v]: true,
                        }),
                        {},
                        //INFO: TS2322: Type 'string[]' is not assignable to type '{ [id: string]: boolean; }'.
                      ) as unknown as { [id: string]: boolean };

                      return (
                        <EuiButtonGroup
                          options={toggleButtonsMulti}
                          idToSelectedMap={selectedMap}
                          onChange={(id) => {
                            if (value.includes(id)) {
                              onChange(value.filter((v) => v !== id));
                              return;
                            }
                            if (!value.includes(id)) {
                              onChange([...value, id]);
                            }
                          }}
                          legend="Week days"
                          color="primary"
                          type="multi"
                          isDisabled={!isDraft}
                        />
                      );
                    }}
                  />
                </EuiFormRow>
              )}
              {watch("repeat") === "monthly" && (
                <EuiFlexItem>
                  <EuiFormRow css={cStyles.removeDatePickerTopMargin}>
                    <Controller
                      control={control}
                      name="selectedDays"
                      render={({ field: { onChange, value, ref } }) => {
                        return (
                          <EuiDatePicker
                            fullWidth
                            inline
                            shadow={false}
                            //@ts-ignore //INFO: renderCustomHeader is not a valid prop in types but
                            renderCustomHeader={() => {}}
                            showMonthDropdown={false}
                            maxDate={moment().year(dateYear).month(12).date(31)}
                            showYearDropdown={false}
                            highlightDates={value}
                            inputRef={ref}
                            readOnly={!isDraft}
                            onChange={(date) => {
                              const dateMoment = date.set({
                                month: 12,
                                year: dateYear,
                              });

                              if (!dateMoment) return;

                              const exists = value.some(
                                (m: Moment) => moment(m).format("DD") === dateMoment.format("DD"),
                              );

                              if (exists) {
                                // Remove the moment if it exists
                                onChange(
                                  value.filter(
                                    (m: Moment) =>
                                      moment(m).format("DD") !== dateMoment.format("DD"),
                                  ),
                                );
                              } else {
                                // Append the new moment value
                                onChange([...value, dateMoment]);
                              }
                            }}
                          />
                        );
                      }}
                    />
                  </EuiFormRow>
                </EuiFlexItem>
              )}
            </EuiFlexItem>
          </EuiFlexGrid>
          <EuiSpacer size="s" />
          <EuiFlexGrid columns={2} gutterSize="s" alignItems="end">
            <EuiFlexItem>
              <EuiFormRow
                label="Ends"
                isInvalid={!!errors.end?.message}
                error={[errors.end?.message]}
              >
                <Controller
                  control={control}
                  name="end"
                  render={({ field }) => (
                    <EuiSelect {...field} options={endOptions} disabled={!isDraft} />
                  )}
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              {watch("end") === "after" && (
                <EuiFormRow
                  isInvalid={!!errors.recur_count?.message}
                  error={[errors.recur_count?.message]}
                >
                  <Controller
                    control={control}
                    name="recur_count"
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                      <EuiFieldNumber
                        value={value}
                        onChange={(e) => onChange(+e.target.value)}
                        onBlur={onBlur}
                        append="occurrences"
                        inputRef={ref}
                        readOnly={!isDraft}
                      />
                    )}
                  />
                </EuiFormRow>
              )}
              {watch("end") === "on" && (
                <EuiFormRow
                  label=""
                  isInvalid={!!errors.end_date?.message}
                  error={[errors.end_date?.message]}
                >
                  <Controller
                    control={control}
                    name="end_date"
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                      <EuiDatePicker
                        showTimeSelect
                        minDate={watch("start_date")}
                        selected={value as Moment}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder="On"
                        inputRef={ref}
                        readOnly={!isDraft}
                      />
                    )}
                  />
                </EuiFormRow>
              )}
            </EuiFlexItem>
          </EuiFlexGrid>
        </>
      )}
      <EuiSpacer size="m" />
      {isDraft && (
        <EuiButton
          iconType={data?.start_date ? "timeRefresh" : "plus"}
          type="submit"
          isLoading={isMutating}
          disabled={isMutating}
        >
          {data?.start_date ? "Update" : "Create"} Recurrence Rule
        </EuiButton>
      )}
    </EuiForm>
  );
};

export default ReccurenceRule;
