import { EuiButton, EuiButtonIcon, EuiFlexItem } from "@elastic/eui";
import { useRouter } from "next/router";

const JumpToCreateChannelButton = ({ show }: { show: boolean }) => {
  const router = useRouter();

  if (!show) return null;

  return (
    <EuiFlexItem>
      <EuiButton
        onClick={() =>
          router.push("/dashboards/channels", {
            query: {
              create: true,
            },
          })
        }
        color="primary"
        iconType="plus"
        size="m"
        fullWidth
      >
        Add channel
      </EuiButton>
    </EuiFlexItem>
  );
};

export default JumpToCreateChannelButton;
