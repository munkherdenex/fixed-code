import { css } from "@emotion/react";

export const globalStyes = css`
  :root {
    --gjs-primary-color: #fff;
    --gjs-secondary-color: #333;
    --gjs-tertiary-color: #ec5896;
    --gjs-quaternary-color: #ec5896;
  }


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
  width250: css`
    width: 250px;
  `,
  width300: css`
    width: 300px;
  `,
  width305: css`
    width: 305px;
  `,
  clamp200auto305: css`
    width: clamp(200px, 100%, 305px);
  `,
  removeComboBoxCloseButton: css`
  .euiBadge__iconButton {
    display: none;
  `,
  removeDatePickerTopMargin: css`
    .react-datepicker {
      .react-datepicker__day-names {
        display: none;
      }
      .react-datepicker__day--selected {
        background-color: #f0f0f0;
        color: #006bb4;
      }
      .react-datepicker__day--highlighted {
        background-color: rgba(0, 191, 179, 0.2) !important;
        color: #00726b !important;
      }
      .react-datepicker__day--outside-month {
        opacity: 0;
      }
      .react-datepicker__month-container {
        margin-top: 0 !important;
      }
    }
  `,
});
