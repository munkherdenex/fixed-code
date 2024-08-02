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
});
