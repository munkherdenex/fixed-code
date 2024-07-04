import { EuiButtonIcon, EuiFlexItem } from "@elastic/eui";
import { useRouter } from "next/router";

const JumpToCreateChannelButton = ({ show }: { show: boolean }) => {
  const router = useRouter();

  if (!show) return null;

  return (
    <EuiFlexItem grow={false}>
      <EuiButtonIcon
        onClick={() =>
          router.push("/dashboards/channels", {
            query: {
              create: true,
            },
          })
        }
        display="base"
        color="primary"
        iconType="plus"
        size="m"
      />
    </EuiFlexItem>
  );
};

export default JumpToCreateChannelButton;
