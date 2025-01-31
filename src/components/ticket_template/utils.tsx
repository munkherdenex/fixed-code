import {
  EuiButton,
  EuiButtonIcon,
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
        <EuiSwitch
          {...register(item.attr_name)}
          label="Switch"
          checked={false}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
      );
    case "file":
      return <EuiFilePicker {...register(item.attr_name)} value={value}
      onChange={onChange}
      onBlur={onBlur}/>;
    case "date":
      return <EuiDatePicker {...register(item.attr_name)} value={value}
      onChange={onChange}
      onBlur={onBlur}/>;
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
        <>
          <EuiButton size="s">Select customer</EuiButton>
        </>
      );
    case "emotion":
      return (
        <>
          <EuiButtonIcon display="base" size="m" iconType={"faceSad"} color="danger" />
          <EuiButtonIcon display="base" size="m" iconType={"faceSad"} color="warning" />
          <EuiButtonIcon display="base" size="m" iconType={"faceNeutral"} color="text" />
          <EuiButtonIcon display="base" size="m" iconType={"faceHappy"} color="primary" />
          <EuiButtonIcon display="base" size="m" iconType={"faceHappy"} color="success" />
        </>
      );
    default:
      return <EuiText><p>Field type not supported</p></EuiText>
  }
};

export default getFieldComponent;
