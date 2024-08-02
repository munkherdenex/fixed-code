import { css } from "@emotion/react";

export const quillEditorStyles = (data_null=null) => ({
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
