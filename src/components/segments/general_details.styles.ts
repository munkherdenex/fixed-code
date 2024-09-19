import { css } from "@emotion/react";

export const generalDetailsStyles = (theme) => ({
  conditionContainer: css`
    background-color: ${theme === "dark" ? "#1d1e24" : "#f7f8fc"};
    padding: 20px;
    border: 1px solid #e4e6f0;
    border-radius: 4px;
  `,
  conditionGroup: css`
    background-color: #fff;
    padding: 10px 10px 0 10px;
    border: 1px solid #e4e6f0;
    border-radius: 4px;
    margin-bottom: 10px;
  `,
});
