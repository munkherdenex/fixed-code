import { css } from "@emotion/react";

export const quillEditorStyles = () => ({
  iframe: css`
    width: 100%;
    height: 100%;
    border: none;
  `,
  quill_container: css`
    height: 140px;
    max-height: 150px;
    margin-bottom: 70px;
  `,
  quill_result: css`
    max-width: 100px;
    max-height: 200px;
  `,
  quill_edit: css`
    min-width: 100%;
    min-height: 280px;
  `,
  quillEditorContainer: css`
    max-width: 100% !important;
    .quill {
      min-height: 340px;
      height: auto;
      margin-bottom: 0px;
      .ql-container {
        min-height: 250px;
        .ql-editor {
          min-height: 250px;
        }
      }
    }
  `,
});
