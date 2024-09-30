import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiTitle,
} from "@elastic/eui";
import moment from "moment";
import { SetStateAction, useState } from "react";
import { useCampaignContext } from "../../store/campaign_store";
import ReccurenceRule from "./reccurence_rule";

const Flyout = ({
  setIsFlyoutVisible,
}: {
  setIsFlyoutVisible: React.Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <EuiFlyout ownFocus onClose={() => setIsFlyoutVisible(false)}>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2>A typical flyout</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <ReccurenceRule setIsFlyoutVisible={setIsFlyoutVisible} />
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

const ReccurenceRuleLayout = () => {
  const { data } = useCampaignContext();
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  return (
    <>
      <EuiFlexGroup style={{ height: "100%" }} alignItems="center" justifyContent="spaceBetween">
        {data?.start_date && (
          <EuiFlexItem>{moment(data?.start_date).format("YYYY-MM-DD LT")}</EuiFlexItem>
        )}
        {data?.start_date && (
          <EuiFlexItem>
            <EuiButton
              color="primary"
              iconType="timeRefresh"
              onClick={() => setIsFlyoutVisible(true)}
            >
              Update Recurrence Rule
            </EuiButton>
          </EuiFlexItem>
        )}
        {!data?.start_date && (
          <EuiFlexItem>
            <EuiButton color="primary" iconType="plus" onClick={() => setIsFlyoutVisible(true)}>
              Add Recurrence Rule
            </EuiButton>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
      {isFlyoutVisible && <Flyout setIsFlyoutVisible={setIsFlyoutVisible} />}
    </>
  );
};

export default ReccurenceRuleLayout;
