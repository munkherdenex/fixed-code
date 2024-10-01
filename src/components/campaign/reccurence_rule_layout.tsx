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

  const isDraft = data?.status === "DRAFT";

  return (
    <>
      <EuiFlexGroup direction="column" gutterSize="s">
        {data?.start_date || data?.end_date || data?.recur_count ? (
          <EuiFlexItem>
            <EuiFlexGroup gutterSize="xs" direction="column" justifyContent="spaceBetween">
              {data?.start_date && (
                <EuiFlexItem>
                  Start date: {moment(data?.start_date).format("YYYY-MM-DD LT")}
                </EuiFlexItem>
              )}
              {data?.end_date && (
                <EuiFlexItem>
                  End date: {moment(data?.end_date).format("YYYY-MM-DD LT")}
                </EuiFlexItem>
              )}
              {data?.recur_count ? (
                <EuiFlexItem>Recur count: {data?.recur_count}</EuiFlexItem>
              ) : (
                <></>
              )}
            </EuiFlexGroup>
          </EuiFlexItem>
        ) : (
          <EuiFlexItem>No recurrence scheduled</EuiFlexItem>
        )}
        {data?.start_date && isDraft && (
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
        {!data?.start_date && isDraft && (
          <EuiFlexItem>
            <EuiButton color="primary" iconType="plus" onClick={() => setIsFlyoutVisible(true)}>
              Add Recurrence Rule
            </EuiButton>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
      {isFlyoutVisible && isDraft && <Flyout setIsFlyoutVisible={setIsFlyoutVisible} />}
    </>
  );
};

export default ReccurenceRuleLayout;
