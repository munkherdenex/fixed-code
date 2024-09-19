import { EuiButton } from "@elastic/eui";
import { useState } from "react";
import CreateFieldFlyout from "./create_field_flyout";

const CreateFieldFlyoutContainer = () => {
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
        key="create-customer"
      >
        Create custom attribute
      </EuiButton>
      {isFlyoutVisible && <CreateFieldFlyout closeFlyout={closeFlyout} />}
    </div>
  );
};

export default CreateFieldFlyoutContainer;
