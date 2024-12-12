import { EuiButton } from "@elastic/eui";
import { useState } from "react";
import CreateChannelFlyout from "./create_channel_flyot";
import { useTranslations } from "next-intl";

const CreateChannelFlyoutContainer = () => {
  const translate = useTranslations();
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
        {translate("create_channel")}
      </EuiButton>
      {isFlyoutVisible && <CreateChannelFlyout closeFlyout={closeFlyout} />}
    </div>
  );
};

export default CreateChannelFlyoutContainer;
