import { css } from "@emotion/react";

export const globalStyes = css`
  #__next,
  .guideBody {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
`;

export const commonStyles = () => ({
  overflowHidden: css`
    overflow: hidden;
  `,
  overflowAuto: css`
    overflow: auto;
  `,
  tourStep: css`
    width: 100%;
  `,

  width130: css`
    width: 120px;
  `,
  width150: css`
    width: 150px;
  `,
  width200: css`
    width: 200px;
  `,
});
