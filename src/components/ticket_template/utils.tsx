import {
  EuiBadge,
  EuiButton,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiDatePicker,
  EuiFieldNumber,
  EuiFieldText,
  EuiFilePicker,
  EuiSelect,
  EuiSelectable,
  EuiSwitch,
  EuiText,
  EuiTextArea,
} from "@elastic/eui";
import { css } from "@emotion/react";
import { useCallback, useState } from "react";
import useGetCustomers, { CustomersResponse } from "../../hooks/useGetCustomers";

const emotionRowStyle = css`
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 5 equal columns */
  gap: 10px;

  & .emotion-button {
    font-size: 2em;
    line-height: 2em;
    padding-block: 0;
    padding-inline: 0;
  }
`;

const EmotionInput = ({ label, onChange, value, ...props }) => {
  const [selectedEmotion, setSelectedEmotion] = useState(value || null);

  const handleEmotionSelect = useCallback(
    (emotion) => {
      setSelectedEmotion(emotion);
      onChange(emotion);
    },
    [onChange],
  );

  const emotions = [
    { name: "Ууртай", emoji: "😠", value: "angry" },
    { name: "Сэтгэл дундуур", emoji: "😔", value: "sad" },
    { name: "Дундын", emoji: "😐", value: "neutral" },
    { name: "Баяртай", emoji: "😊", value: "happy" },
    { name: "Маш их баярласан", emoji: "🤩", value: "excited" },
  ];

  return (
    <div css={emotionRowStyle}>
      {emotions.map((emotion) => (
        <EuiButton
          key={emotion.value}
          className={`emotion-button ${selectedEmotion?.value === emotion.value ? "selected" : ""}`}
          onClick={() => handleEmotionSelect(emotion)}
          aria-label={emotion.name}
          fill={selectedEmotion?.value === emotion.value}
          title={emotion.name}
        >
          {emotion.emoji}
        </EuiButton>
      ))}

      <input type="hidden" value={selectedEmotion?.value} name={props.name} {...props} />
    </div>
  );
};

const SwitchInput = ({ item, register, onBlur, onChange, value, ...props }) => {
  const [value1, setValue] = useState(value);
  const onSwitchChange = (e) => {
    setValue(e.target.checked);
    onChange(e.target.checked);
  };
  return (
    <EuiSwitch
      {...register(item.attr_name)}
      showLabel={false}
      checked={value1}
      onChange={onSwitchChange}
      onBlur={onBlur}
    />
  );
};

const DateInput = ({ item, register, onBlur, onChange, value, ...props }) => {
  const [value1, setValue] = useState(value);
  const onDateChange = (e) => {
    setValue(e);
    onChange(e);
  };
  return (
    <EuiDatePicker
      {...register(item.attr_name)}
      selected={value1}
      onChange={onDateChange}
      onBlur={onBlur}
    />
  );
};

const CustomerSelector = ({ item, register, onBlur, onChange, value, ...props }) => {
  let searchTimeout: NodeJS.Timeout;
  const [value1, setValue] = useState(value);
  const [searchValue, setSearchValue] = useState("");

  const { data: segmentCustomers, isLoading } = useGetCustomers<CustomersResponse>(null, {
    query: searchValue,
    limit: '5',
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

  const onSearchChange = (value: string) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setSearchValue(value);
    }, 500);
  };

  return (
    <>
      <EuiComboBox
        placeholder="Имэйл, утас..."
        singleSelection={{ asPlainText: true }}
        options={dataTypeOptions}
        onChange={(selected) => {
          setValue(selected);
          onChange(selected.length > 0 ? selected[0].value : null);
        }}
        optionMatcher={({ option, searchValue }) => {
          return option?.["aria-label"].includes(searchValue);
        }}
        selectedOptions={value1}
        onSearchChange={onSearchChange}
        onBlur={onBlur}
        isClearable={false}
        isLoading={isLoading}
      />

      <input type="hidden" value={value1 && value1[0]?.value} name={item.attr_name} {...props} />
      {value1 && `Selected : ${ value1[0]?.label } - ${ value1[0]?.value }`}
    </>
  );
};

const getFieldComponent = (item, register, value, onChange, onBlur) => {
  switch (item.type) {
    case "text":
      if (item.config?.isMultiline) {
        return (
          <EuiTextArea
            {...register(item.attr_name)}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
          />
        );
      }
      return (
        <EuiFieldText
          {...register(item.attr_name)}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
      );
    case "number":
      return (
        <EuiFieldNumber
          {...register(item.attr_name)}
          min={item.config?.min}
          max={item.config?.max}
          step={item.config?.step}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
      );
    case "choice":
      if (item.config?.isMultiple) {
        return (
          <EuiSelectable
            {...register(item.attr_name)}
            options={item.config?.choices}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
          />
        );
      }
      return (
        <EuiSelect
          {...register(item.attr_name)}
          options={item.config?.choices}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
      );
    case "boolean":
      return (
        <SwitchInput
          register={register}
          item={item}
          showLabel={false}
          checked={false}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
      );
    case "file":
      return (
        <EuiFilePicker
          {...register(item.attr_name)}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
      );
    case "date":
      return (
        <DateInput
          item={item}
          register={register}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
      );
    case "worker":
      return (
        <>
          <EuiButton {...register(item.attr_name)} size="s">
            Select worker
          </EuiButton>
        </>
      );
    case "customer":
      return (
        <CustomerSelector item={item} {...register(item.attr_name)} value={value} onChange={onChange} />
      );
    case "emotion":
      return <EmotionInput {...register(item.attr_name)} value={value} onChange={onChange} />;
    default:
      return (
        <EuiText>
          <p>Field type not supported</p>
        </EuiText>
      );
  }
};

export default getFieldComponent;
