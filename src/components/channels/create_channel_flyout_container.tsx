import { EuiButton } from "@elastic/eui";
import { useState } from "react";
import CreateChannelFlyout from "./create_channel_flyot";

const CreateChannelFlyoutContainer = () => {
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  const closeFlyout = () => {
    setIsFlyoutVisible(false);
  };

  return (
    <div>
      <EuiButton
        color="primary"
        onClick={() => setIsFlyoutVisible(true)}
        fill
        key="create-channels"
      >
        Create channel
      </EuiButton>
      {isFlyoutVisible && <CreateChannelFlyout closeFlyout={closeFlyout} />}
    </div>
  );
};

export default CreateChannelFlyoutContainer;
