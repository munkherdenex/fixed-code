import { css } from "@emotion/react";

export const signupFormStyles = (euiTheme) => ({
  container: css`
    padding-bottom: ${euiTheme.size.base};

    @media (max-width: ${euiTheme.breakpoint.m}px) {
      text-align: center;

      > .euiFlexItem:first-of-type {
        order: 2;
      }
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
});
