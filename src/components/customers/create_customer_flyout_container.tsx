import { EuiButton } from "@elastic/eui";
import { useState } from "react";
import CreateCustomerComponent from "./create_customer";
import { useTranslations } from "next-intl";
import AdminComponent from "../admin_component";

const CreateCustomerFlyoutContainer = () => {
  const translate = useTranslations();
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  return (
    <AdminComponent>
      <>
        <EuiButton
          color="primary"
          onClick={() => setIsFlyoutVisible(true)}
          fill
          key="audience-customer"
        >
          {translate("create-audience")}
        </EuiButton>
        {isFlyoutVisible && <CreateCustomerComponent setIsFlyoutVisible={setIsFlyoutVisible} />}
      </>
    </AdminComponent>
  );
};

export default CreateCustomerFlyoutContainer;
