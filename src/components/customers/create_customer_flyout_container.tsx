import { EuiButton } from "@elastic/eui";
import { useState } from "react";
import CreateCustomerComponent from "./create_customer";

const CreateCustomerFlyoutContainer = () => {
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  return (
    <div>
      <EuiButton
        color="primary"
        onClick={() => setIsFlyoutVisible(true)}
        fill
        key="audience-customer"
      >
        Create audience
      </EuiButton>
      {isFlyoutVisible && <CreateCustomerComponent setIsFlyoutVisible={setIsFlyoutVisible} />}
    </div>
  );
};

export default CreateCustomerFlyoutContainer;
