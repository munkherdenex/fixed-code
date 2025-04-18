import {
  EuiBadge,
  EuiButton,
  EuiButtonIcon,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiDatePicker,
  EuiFieldNumber,
  EuiFieldText,
  EuiFilePicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSelect,
  EuiSelectable,
  EuiSwitch,
  EuiText,
  EuiTextArea,
} from "@elastic/eui";
import { css } from "@emotion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import useGetCustomers, { CustomersResponse } from "../../hooks/useGetCustomers";
import useSWR, { mutate } from "swr";
import ticketApi from "../../api/ticket";

const emotionRowStyle = css`
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 columns */
  gap: 10px;
  & .emotion-button {
    font-size: 2em;
    line-height: 2em;
    padding-block: 0;
    padding-inline: 0;
  }
`;

const TextInput = ({ item, register, onBlur, onChange, value, ...props }) => {
  const [value1, setValue] = useState(item.value);
  const [isEditing, setIsEditing] = useState(false);
  const onTextChange = (e) => {
    setValue(e.target.value);
    onChange(e);
  };
  const toggleEdit = () => {
    setValue(item.value);
    setIsEditing(!isEditing);
  };
  const saveEdit = async () => {
    try {
      let payload = {
        [item.attr_name]: value1,
      };
      await ticketApi.update(item.ticket, payload);
      mutate("/crm/ticket/");
      setIsEditing(!isEditing);
    } catch (error) {
      console.error("Failed to update ticket:", error);
      mutate("/crm/ticket/");
    }
  };
  return (
    <EuiFlexGroup justifyContent="flexStart" alignItems="center">
      <EuiFlexItem grow={false}>
        {isEditing ? (
          item.config?.isMultiline ? (
            <EuiTextArea value={item.value} onChange={onTextChange} onBlur={onBlur} />
          ) : (
            <EuiFieldText value={item.value} onChange={onTextChange} onBlur={onBlur} />
          )
        ) : (
          <div>{value1 ? value1 : "Null"}</div>
        )}
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            {!isEditing ? (
              <EuiButtonIcon onClick={toggleEdit} iconType="pencil" aria-label="Edit" />
            ) : (
              <EuiButtonIcon onClick={saveEdit} iconType="check" aria-label="Save" />
            )}
          </EuiFlexItem>
          {isEditing && (
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                onClick={toggleEdit}
                iconType="error"
                color="danger"
                aria-label="cancel"
              />
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

const NumberInput = ({ item, register, onBlur, onChange, value, ...props }) => {
  const [value1, setValue] = useState(item.value);
  const [isEditing, setIsEditing] = useState(false);
  const onNumberChange = (e) => {
    setValue(e.target.value);
    onChange(e);
  };
  const toggleEdit = () => {
    setValue(item.value);
    setIsEditing(!isEditing);
  };
  const saveEdit = async () => {
    try {
      let payload = {
        [item.attr_name]: value1,
      };
      await ticketApi.update(item.ticket, payload);
      mutate("/crm/ticket/");
      setIsEditing(!isEditing);
    } catch (error) {
      console.error("Failed to update ticket:", error);
      mutate("/crm/ticket/");
    }
  };
  return (
    <EuiFlexGroup justifyContent="flexStart" alignItems="center">
      <EuiFlexItem grow={isEditing ? true : false}>
        {isEditing ? (
          <EuiFieldNumber
            min={item.config?.min}
            max={item.config?.max}
            step={item.config?.step}
            value={value1}
            onChange={(e) => onNumberChange(e)}
            onBlur={onBlur}
          />
        ) : (
          <div>{value1 ? value1 : "Null"}</div>
        )}
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            {!isEditing ? (
              <EuiButtonIcon onClick={toggleEdit} iconType="pencil" aria-label="Edit" />
            ) : (
              <EuiButtonIcon onClick={saveEdit} iconType="check" aria-label="Save" />
            )}
          </EuiFlexItem>
          {isEditing && (
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                onClick={toggleEdit}
                iconType="error"
                color="danger"
                aria-label="cancel"
              />
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

const EmotionInput = ({ item, label, onChange, value, ...props }) => {
  const [selectedEmotion, setSelectedEmotion] = useState(value || null);
  const [isEditing, setIsEditing] = useState(false);

  const handleEmotionSelect = useCallback(
    (emotion) => {
      setSelectedEmotion(emotion);
      onChange(emotion);
    },
    [onChange],
  );

  const toggleEdit = () => {
    setSelectedEmotion(value);
    setIsEditing(!isEditing);
  };
  const saveEdit = async () => {
    try {
      let payload = {
        [item.attr_name]: selectedEmotion,
      };
      await ticketApi.update(item.ticket, payload);
      mutate("/crm/ticket/");
      setIsEditing(!isEditing);
    } catch (error) {
      console.error("Failed to update ticket:", error);
      mutate("/crm/ticket/");
    }
  };

  const emotions = [
    { name: "Ууртай", emoji: "😠", value: "angry" },
    { name: "Сэтгэл дундуур", emoji: "😔", value: "sad" },
    { name: "Дундын", emoji: "😐", value: "neutral" },
    { name: "Баяртай", emoji: "😊", value: "happy" },
    { name: "Маш их баярласан", emoji: "🤩", value: "excited" },
  ];

  return (
    <div css={emotionRowStyle}>
      <EuiFlexGroup justifyContent="flexStart" alignItems="center">
        {isEditing ? (
          <EuiFlexItem grow={false}>
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
          </EuiFlexItem>
        ) : (
          <EuiFlexItem grow={false}>
            <EuiButton
              key={selectedEmotion?.value}
              className={`emotion-button ${selectedEmotion?.value === selectedEmotion?.value ? "selected" : ""}`}
              onClick={() => handleEmotionSelect(selectedEmotion)}
              aria-label={selectedEmotion?.name}
              fill={selectedEmotion?.value === selectedEmotion?.value}
              title={selectedEmotion?.name}
            >
              {selectedEmotion?.emoji}
            </EuiButton>
          </EuiFlexItem>
        )}

        <EuiFlexItem grow={false}>
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              {!isEditing ? (
                <EuiButtonIcon onClick={toggleEdit} iconType="pencil" aria-label="Edit" />
              ) : (
                <EuiButtonIcon onClick={saveEdit} iconType="check" aria-label="Save" />
              )}
            </EuiFlexItem>
            {isEditing && (
              <EuiFlexItem grow={false}>
                <EuiButtonIcon
                  onClick={toggleEdit}
                  iconType="error"
                  color="danger"
                  aria-label="cancel"
                />
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
};

const ComboboxInput = ({ item, register, onBlur, onChange, value, ...props }) => {
  const [value1, setValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const onSwitchChange = (e) => {
    setValue(e.target.value);
    onChange(e.target.value);
  };
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };
  const saveEdit = async () => {
    try {
      let payload = {
        [item.attr_name]: value1,
      };
      await ticketApi.update(item.ticket, payload);
      mutate("/crm/ticket/");
      setIsEditing(!isEditing);
    } catch (error) {
      console.error("Failed to update ticket:", error);
      mutate("/crm/ticket/");
    }
  };
  return (
    <EuiFlexGroup justifyContent="flexStart" alignItems="center">
      <EuiFlexItem grow={false}>
        {isEditing ? (
          item.config?.isMultiple ? (
            <EuiSelectable
              options={item.config?.choices}
              onChange={(e) => onSwitchChange(e)}
              onBlur={onBlur}
            />
          ) : (
            <EuiSelect
              options={item.config?.choices}
              value={value1}
              onChange={(e) => onSwitchChange(e)}
              onBlur={onBlur}
            />
          )
        ) : (
          <div>{value1 ? value1 : "Null"}</div>
        )}
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            {!isEditing ? (
              <EuiButtonIcon onClick={toggleEdit} iconType="pencil" aria-label="Edit" />
            ) : (
              <EuiButtonIcon onClick={saveEdit} iconType="check" aria-label="Save" />
            )}
          </EuiFlexItem>
          {isEditing && (
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                onClick={toggleEdit}
                iconType="error"
                color="danger"
                aria-label="cancel"
              />
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

const SwitchInput = ({ item, register, onBlur, onChange, value, ...props }) => {
  const [value1, setValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const onSwitchChange = (e) => {
    setValue(e.target.checked);
    onChange(e.target.checked);
  };
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };
  const saveEdit = async () => {
    try {
      let payload = {
        [item.attr_name]: value1,
      };
      await ticketApi.update(item.ticket, payload);
      mutate("/crm/ticket/");
      setIsEditing(!isEditing);
    } catch (error) {
      console.error("Failed to update ticket:", error);
      mutate("/crm/ticket/");
    }
  };
  return (
    <EuiFlexGroup justifyContent="flexStart" alignItems="center">
      <EuiFlexItem grow={false}>
        {isEditing ? (
          <EuiSwitch
            {...register(item.attr_name)}
            showLabel={false}
            checked={value1}
            onChange={onSwitchChange}
            onBlur={onBlur}
          />
        ) : (
          <div>{value1 ? "True" : "False"}</div>
        )}
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            {!isEditing ? (
              <EuiButtonIcon onClick={toggleEdit} iconType="pencil" aria-label="Edit" />
            ) : (
              <EuiButtonIcon onClick={saveEdit} iconType="check" aria-label="Save" />
            )}
          </EuiFlexItem>
          {isEditing && (
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                onClick={toggleEdit}
                iconType="error"
                color="danger"
                aria-label="cancel"
              />
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
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
  const [prevValue, setPrevValue] = useState(value);
  const [searchValue, setSearchValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data: segmentCustomers, isLoading } = useGetCustomers<CustomersResponse>(null, {
    query: searchValue,
    limit: "5",
  });

  const dataTypeOptions: EuiComboBoxOptionOption[] = useMemo(() => {
    return (
      segmentCustomers?.results?.map((customer) => {
        return {
          label: customer?.email || customer?.phone || customer?.rid,
          "aria-label": `${customer?.email} ${customer?.phone} ${customer?.rid}`,
          value: String(customer?.id),
          append: <EuiBadge>{customer?.phone || customer?.email || customer?.rid}</EuiBadge>,
        };
      }) || []
    );
  }, [segmentCustomers?.results]);

  useEffect(() => {
    const matchingOption = dataTypeOptions.find((option) => option.value === item.value);
    if (matchingOption) {
      setValue([matchingOption]);
    }
  }, [dataTypeOptions, item.value]);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const onSearchChange = (value: string) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setSearchValue(value);
    }, 500);
  };

  const saveEdit = async () => {
    try {
      let payload = {
        [item.attr_name]: value1[0]?.value,
      };
      // console.log(item.ticket);
      // console.log(payload);
      await ticketApi.update(item.ticket, payload);
      mutate("/crm/ticket/");
      setIsEditing(!isEditing);
    } catch (error) {
      console.error("Failed to update ticket:", error);
      mutate("/crm/ticket/");
    }
  };

  return (
    <EuiFlexGroup justifyContent="flexStart" alignItems="center">
      <EuiFlexItem grow={false}>
        {isEditing ? (
          <>
            <EuiComboBox
              placeholder="И-мэйл, утас..."
              singleSelection={{ asPlainText: true }}
              options={dataTypeOptions}
              onChange={(selected) => {
                setPrevValue(value1);
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

            <input
              type="hidden"
              value={value1 && value1[0]?.value}
              name={item.attr_name}
              {...props}
            />
            {/* {value1 && `Selected : ${value1[0]?.label} - ${value1[0]?.value}`} */}
          </>
        ) : (
          <EuiText>{value1?.map((opt) => opt.label).join(", ")}</EuiText>
        )}
      </EuiFlexItem>

      <EuiFlexItem grow={false}>
        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            {!isEditing ? (
              <EuiButtonIcon onClick={toggleEdit} iconType="pencil" aria-label="Edit" />
            ) : (
              <EuiButtonIcon onClick={saveEdit} iconType="check" aria-label="Save" />
            )}
          </EuiFlexItem>
          {isEditing && (
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                onClick={toggleEdit}
                iconType="error"
                color="danger"
                aria-label="cancel"
              />
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

const getFieldComponentEdit = (item, register, value, onChange, onBlur) => {
  switch (item.type) {
    case "text":
      return (
        <TextInput
          item={item}
          {...register(item.attr_name)}
          min={item.config?.min}
          max={item.config?.max}
          step={item.config?.step}
          value={item.value}
          onChange={onChange}
          onBlur={onBlur}
        />
      );
    case "number":
      return (
        <NumberInput
          item={item}
          {...register(item.attr_name)}
          min={item.config?.min}
          max={item.config?.max}
          step={item.config?.step}
          value={item.value}
          onChange={onChange}
          onBlur={onBlur}
        />
      );
    case "choice":
      return (
        <ComboboxInput
          item={item}
          {...register(item.attr_name)}
          options={item.config?.choices}
          value={item.value}
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
          value={item.value}
          onChange={onChange}
          onBlur={onBlur}
        />
      );
    case "file":
      return (
        <EuiFilePicker
          {...register(item.attr_name)}
          value={item.value}
          onChange={onChange}
          onBlur={onBlur}
        />
      );
    case "date":
      return (
        <DateInput
          item={item}
          register={register}
          value={item.value}
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
        <CustomerSelector
          item={item}
          {...register(item.attr_name)}
          value={value}
          onChange={onChange}
        />
      );
    case "emotion":
      return (
        <EmotionInput
          item={item}
          {...register(item.attr_name)}
          value={item.value}
          onChange={onChange}
        />
      );

    default:
      return (
        <EuiText>
          <p>Field type not supported</p>
        </EuiText>
      );
  }
};

export default getFieldComponentEdit;
