import { EuiBadge } from "@elastic/eui";
import { css } from "@emotion/react";
import { callStateOptions } from './table';

export const CallStateBadge = ({ callState }: { callState: string }) => {
  console.log("CS", callState)
  return (
    <EuiBadge
      color={"hollow"}
      iconType="dot"
      css={
        callState == "answered"
          ? css`
              animation: glow 2s infinite;
              @keyframes glow {
                0% {
                  background-color: rgba(0, 255, 0, 0);
                }
                50% {
                  background-color: rgba(0, 255, 0, 0.5);
                }
              }
            `
          : undefined
      }
    >
      {callStateOptions.find((option) => option.value === callState)?.label || callState}
    </EuiBadge>
  );
};
