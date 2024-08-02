import { Control, Controller } from "react-hook-form";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { quillEditorStyles } from "./quill_editor.styles";

const QuillEditorComponent = ({
  control,
  onChange,
}: {
  control: Control;
  onChange: (value: string) => void;
}) => {
  const ReactQuill = useMemo(() => dynamic(() => import('react-quill'), { ssr: false }), []);
  var toolbarOptions = [
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],
    ["link", "image", "video", "formula"],

    [{ header: 1 }, { header: 2 }],
    [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],

    [{ size: ["small", false, "large", "huge"] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],

    ["clean"],
  ];
  const styles = quillEditorStyles();

  const module = {
    toolbar: toolbarOptions,
  };

  return (
    <div>
      <Controller
        control={control}
        name="body"
        render={({ field: { onBlur, value } }) => (
          <ReactQuill
            modules={module}
            theme="snow"
            value={value}
            onBlur={onBlur}
            onChange={onChange}
            css={!value && styles.quill_container}
          />
        )}
      />
    </div>
  );
};

export default QuillEditorComponent;
