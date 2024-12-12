import { EuiButton } from "@elastic/eui";
import { useState } from "react";
import ImportAudienceComponent from "./import_audience";
import { useTranslations } from "next-intl";
import AdminComponent from "../admin_component";

const ImportAudienceFlyoutContainer = () => {
  const translate = useTranslations();
  const [isImportFlyoutVisible, setIsImportFlyoutVisible] = useState(false);

  return (
    <AdminComponent>
      <>
        <EuiButton
          onClick={() => setIsImportFlyoutVisible(true)}
          fill
          color={"success"}
          iconType={"importAction"}
          key="audience-customer"
        >
          {translate("import")}
        </EuiButton>
        {isImportFlyoutVisible && (
          <ImportAudienceComponent setIsImportFlyoutVisible={setIsImportFlyoutVisible} />
        )}
      </>
    </AdminComponent>
  );
};

export default ImportAudienceFlyoutContainer;
