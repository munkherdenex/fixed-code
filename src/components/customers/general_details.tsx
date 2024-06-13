import {
  EuiAccordion,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  useGeneratedHtmlId,
} from "@elastic/eui";

const GeneralDetails = () => {
  const rightArrowAccordionId = useGeneratedHtmlId({
    prefix: "rightArrowAccordion",
  });

  return (
    <div>
      <EuiPanel>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <EuiPanel paddingSize="s" color="subdued">
              General details
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <p>informations</p>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiAccordion
              id={rightArrowAccordionId}
              arrowDisplay="left"
              buttonContent="Custom Fields"
            >
              <EuiPanel color="subdued">
                Any content inside of <strong>EuiAccordion</strong> will appear here.
              </EuiPanel>
            </EuiAccordion>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </div>
  );
};

export default GeneralDetails;
