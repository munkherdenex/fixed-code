import { useState } from "react";
import { Mention, MentionsInput } from "react-mentions";
import useGetFields, { Fields } from "../../hooks/useGetFields";
import styles from "./default_style";

const MentionInputComponent = () => {
  const { data } = useGetFields<Fields[]>();
  const [value, setValue] = useState("");
  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  const mentionData =
    data &&
    data.map((field) => ({
      id: field.id,
      display: `{{${field.attribute_name}}}`,
    }));

  return (
    <MentionsInput value={value} style={styles} onChange={handleChange}>
      <Mention trigger="@" data={mentionData} />
    </MentionsInput>
  );
};

export default MentionInputComponent;
