import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-solarized_dark";
import "ace-builds/src-noconflict/ext-language_tools";
import { aceEditorStyles } from "./ace_editor.styles";
import { Control, Controller } from "react-hook-form";
import { useRef } from "react";
import { getTheme } from "../../lib/theme";

const AceEditorComponent = ({
  control,
  onChange,
}: {
  control: Control;
  onChange: (value: string) => void;
}) => {
  const aceEditor = useRef();

  const styles = aceEditorStyles();

  const onLoad = () => {
    console.log("i've loaded");
  };

  return (
    <div css={styles.container}>
      <Controller
        control={control}
        name="body"
        render={({ field: { onBlur, value } }) => (
          <AceEditor
            ref={aceEditor}
            placeholder={`{
"greeting": "Hello {{name}}!"
}`}
            mode="json"
            width="400px"
            height="300px"
            theme={getTheme() === "dark" ? "solarized_dark" : "github"}
            name="ace-editor"
            onLoad={onLoad}
            onChange={onChange}
            fontSize={14}
            lineHeight={19}
            onBlur={onBlur}
            value={value}
            showPrintMargin={true}
            showGutter={true}
            highlightActiveLine={true}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: false,
              enableSnippets: true,
              showLineNumbers: true,
              tabSize: 2,
            }}
          />
        )}
      />
    </div>
  );
};

export default AceEditorComponent;
