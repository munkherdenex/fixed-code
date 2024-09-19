import EditEmailLayout from "./edit_email_layout";
import { EuiFlexGroup, EuiFlexItem } from "@elastic/eui";

const EmailLayouts = () => {
  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EditEmailLayout />
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};

export default EmailLayouts;
