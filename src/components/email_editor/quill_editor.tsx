import dynamic from "next/dynamic";
import { ImageDrop } from "quill-image-drop-module";
import ImageResize from "quill-image-resize-module-react";
import { memo } from "react";
import { Control, Controller } from "react-hook-form";
import { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { quillEditorStyles } from "./quill_editor.styles";

Quill.register("modules/imageResize", ImageResize);
Quill.register("modules/imageDrop", ImageDrop);

const ReactQuill = memo(dynamic(() => import("react-quill"), { ssr: false }));

const QuillEditorComponent = ({
  readonly,
  control,
  onChange,
}: {
  readonly?: boolean;
  control?: Control;
  onChange?: (value: string) => void;
}) => {
  const toolbarOptions = [
    ["bold", "italic", "underline", "strike"],
    ["blockquote"],
    ["link", "image", "video"],

    [{ header: 1 }, { header: 2 }],
    [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
    [{ indent: "-1" }, { indent: "+1" }],

    [{ size: ["small", false, "large", "huge"] }],

    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],

    ["clean"],
  ];
  const styles = quillEditorStyles();

  const moduleQuill = {
    toolbar: toolbarOptions,
    clipboard: {
      matchVisual: false,
    },
    imageResize: {
      parchment: Quill.import("parchment"),
      modules: ["Resize", "DisplaySize"],
    },
    imageDrop: true,
  };

  if (readonly) {
    return (
      <Controller
        control={control}
        name="body"
        render={({ field: { onBlur, value } }) => (
          <ReactQuill
            modules={{
              ...moduleQuill,
              toolbar: false,
            }}
            theme="snow"
            value={value}
            onBlur={onBlur}
            onChange={onChange}
            css={!value && styles.quill_container}
            readOnly={readonly}
          />
        )}
      />
    );
  }

  return (
    <div>
      {control ? (
        <Controller
          control={control}
          name="body"
          render={({ field: { onBlur, value } }) => (
            <ReactQuill
              modules={moduleQuill}
              theme="snow"
              value={value}
              onBlur={onBlur}
              onChange={onChange}
              css={!value && styles.quill_container}
              readOnly={readonly}
            />
          )}
        />
      ) : (
        <ReactQuill
          modules={moduleQuill}
          theme="snow"
          onChange={onChange}
          css={styles.quill_container}
          readOnly={readonly}
        />
      )}
    </div>
  );
};

export default QuillEditorComponent;
