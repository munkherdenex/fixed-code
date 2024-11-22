import { EuiButton } from "@elastic/eui";
import { useState } from "react";
import ImportAudienceComponent from "./import_audience";
import { useTranslations } from "next-intl";

const ImportAudienceFlyoutContainer = () => {
  const audienceT = useTranslations("dashboards.cdp.audience");
  const [isImportFlyoutVisible, setIsImportFlyoutVisible] = useState(false);

  return (
    <div>
      <EuiButton
        onClick={() => setIsImportFlyoutVisible(true)}
        fill
        color={"success"}
        iconType={"importAction"}
        key="audience-customer"
      >
        {audienceT("import")}
      </EuiButton>
      {isImportFlyoutVisible && (
        <ImportAudienceComponent setIsImportFlyoutVisible={setIsImportFlyoutVisible} />
      )}
    </div>
  );
};

export default ImportAudienceFlyoutContainer;
