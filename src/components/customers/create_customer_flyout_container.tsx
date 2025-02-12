import { EuiButton, EuiIcon } from "@elastic/eui";
import { useState } from "react";
import CreateCustomerComponent from "./create_customer";
import { useTranslations } from "next-intl";
import AdminComponent from "../admin_component";
import { css } from '@emotion/react';

const mainButtonStyle = css`
  color: white;
  background: #E33255;
`

const CreateCustomerFlyoutContainer = () => {
  const translate = useTranslations();
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  return (
    <AdminComponent>
      <>
        <EuiButton
          css={mainButtonStyle}
          color="accent"
          onClick={() => setIsFlyoutVisible(true)}
          fill
          size='s'
          key="audience-customer"
          iconType="plusInCircleFilled"
        >
          {translate("create-audience")}
        </EuiButton>
        {isFlyoutVisible && <CreateCustomerComponent setIsFlyoutVisible={setIsFlyoutVisible} />}
      </>
    </AdminComponent>
  );
};

export default CreateCustomerFlyoutContainer;
