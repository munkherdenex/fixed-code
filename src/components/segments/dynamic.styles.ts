import { css } from "@emotion/react";

export const dynamicStyles = () => ({
  queryBuilderContainer: css`
    .ruleGroup {
      overflow: auto;
      .ruleGroup-combinators {
        padding: 6px;
        border-radius: 4px;
        color: #343741;
        border: none;
        box-shadow: inset 0 0 0 1px rgba(32, 38, 47, 0.1);
      }
      .rule-fields {
        padding: 6px;
        border-radius: 4px;
        color: #343741;
        border: none;
        box-shadow: inset 0 0 0 1px rgba(32, 38, 47, 0.1);
      }
      .rule-operators {
        padding: 6px;
        border-radius: 4px;
        color: #343741;
        border: none;
        box-shadow: inset 0 0 0 1px rgba(32, 38, 47, 0.1);
      }
    }
    .ruleGroup .ruleGroup .ruleGroup-addGroup {
      display: none;
    }
  `,
});
