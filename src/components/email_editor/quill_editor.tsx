import { Control, Controller } from "react-hook-form";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { quillEditorStyles } from "./quill_editor.styles";
import { Quill } from 'react-quill';
import ImageResize from 'quill-image-resize-module-react';
import { ImageDrop } from 'quill-image-drop-module';

Quill.register('modules/imageResize', ImageResize);
Quill.register('modules/imageDrop', ImageDrop);

const QuillEditorComponent = ({
  control,
  onChange,
}: {
  control?: Control;
  onChange?: (value: string) => void;
}) => {
  const ReactQuill = useMemo(() => dynamic(() => import("react-quill"), { ssr: false }), []);
  var toolbarOptions = [
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

  const module = {
    toolbar: toolbarOptions,
    clipboard: {
      matchVisual: false
    },
    imageResize: {
      parchment: Quill.import('parchment'),
      modules: ['Resize', 'DisplaySize',]
    },
    imageDrop: true
  };

  return (
    <div>
      {
        control ?
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
          :
          <ReactQuill
            modules={module}
            theme="snow"
            onChange={onChange}
            css={styles.quill_container}
          />
      }
    </div>
  );
};

export default QuillEditorComponent;
