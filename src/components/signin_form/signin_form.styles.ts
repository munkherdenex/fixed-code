import { css } from "@emotion/react";

export const signinFormStyles = (euiTheme) => ({
  container: css`
    padding-bottom: ${euiTheme.size.base};

    @media (max-width: ${euiTheme.breakpoint.m}px) {
      text-align: center;
    }
  `,
  form: {
    container: css``,
  },
  title: css`
    @media (min-width: ${euiTheme.breakpoint.m}px) {
      padding-top: ${euiTheme.size.base};
    }
  `,
  subtitle: css`
    margin-top: ${euiTheme.size.l};
    padding-bottom: ${euiTheme.size.m};
  `,
  description: css`
    @media (max-width: ${euiTheme.breakpoint.m}px) {
      align-self: center;
    }
  `,
  toast_msg: css`
    position: absolute;
    bottom: 20px;
    right: 15px;

    @media (max-width: ${euiTheme.breakpoint.m}px) {
      right: 2px; !important
      left: 2px;
    }
  `,
});
