import { css } from "@emotion/react";

export const createTemplateFlyoutStyles = () => ({
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
