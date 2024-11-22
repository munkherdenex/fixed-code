import { EuiButton } from "@elastic/eui";
import { useState } from "react";
import CreateCustomerComponent from "./create_customer";
import { useTranslations } from "next-intl";

const CreateCustomerFlyoutContainer = () => {
  const audienceT = useTranslations("dashboards.cdp.audience");
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  return (
    <div>
      <EuiButton
        color="primary"
        onClick={() => setIsFlyoutVisible(true)}
        fill
        key="audience-customer"
      >
        {audienceT("create-audience")}
      </EuiButton>
      {isFlyoutVisible && <CreateCustomerComponent setIsFlyoutVisible={setIsFlyoutVisible} />}
    </div>
  );
};

export default CreateCustomerFlyoutContainer;
