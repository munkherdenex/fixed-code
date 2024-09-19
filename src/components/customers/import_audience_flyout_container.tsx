import { EuiButton } from "@elastic/eui";
import { useState } from "react";
import ImportAudienceComponent from "./import_audience";

const ImportAudienceFlyoutContainer = () => {
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
        Import
      </EuiButton>
      {isImportFlyoutVisible && (
        <ImportAudienceComponent setIsImportFlyoutVisible={setIsImportFlyoutVisible} />
      )}
    </div>
  );
};

export default ImportAudienceFlyoutContainer;
