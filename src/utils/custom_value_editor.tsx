import { EuiDatePicker, EuiFieldNumber, EuiFieldText, EuiSwitch } from "@elastic/eui";
import moment from "moment";
import { ValueEditorProps, ValueEditor } from "react-querybuilder";

export const CustomValueEditor = (props: ValueEditorProps) => {
  console.info(JSON.stringify(props.fieldData));
  if (props.fieldData.datatype === "date") {
    return (
      <div>
        <EuiDatePicker
          compressed
          selected={!props.value ? null : moment(props.value)}
          onChange={(d) => {
            console.info(JSON.stringify(d.startOf("day")));
            props.handleOnChange(d ? moment(d).startOf("day") : null);
          }}
        />
      </div>
    );
  }
  if (props.fieldData.datatype === "datetime") {
    return (
      <div>
        <EuiDatePicker
          showTimeSelect
          compressed
          selected={!props.value ? null : moment(props.value)}
          onChange={(d) => {
            console.info(JSON.stringify(d));
            props.handleOnChange(d ? moment(d) : null);
          }}
        />
      </div>
    );
  }
  if (props.fieldData.datatype === "int") {
    return (
      <div>
        <EuiFieldNumber
          compressed
          value={!props?.value ? "" : props.value}
          onChange={(e) => props.handleOnChange(e.target.value)}
          aria-label="Use aria labels when no actual label is in use"
        />
      </div>
    );
  }
  if (props.fieldData.datatype === "str" || props.fieldData.datatype === "string") {
    return (
      <div>
        <EuiFieldText
          compressed
          value={!props?.value ? "" : props.value}
          onChange={(e) => props.handleOnChange(e.target.value)}
          aria-label="Use aria labels when no actual label is in use"
        />
      </div>
    );
  }
  if (props.fieldData.datatype === "bool") {
    return (
      <div>
        <EuiSwitch
          compressed
          checked={!props?.value ? "" : props.value}
          onChange={(e) => props.handleOnChange(e.target.checked)}
          label=""
        />
      </div>
    );
  }
  return <ValueEditor {...props} />;
};
