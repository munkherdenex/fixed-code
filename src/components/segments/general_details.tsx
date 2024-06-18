import { EuiFlexGrid, EuiFlexGroup, EuiFlexItem, EuiPanel, EuiSpacer } from "@elastic/eui";
import moment from "moment";
import { Segment } from "../../hooks/useGetSegments";

const GeneralDetails = ({ data }: { data: Segment | undefined }) => {
  if (data === undefined) {
    return null;
  }

  return (
    <div>
      <EuiPanel>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <EuiPanel paddingSize="s" color="subdued">
              <strong>Segment details</strong>
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGrid columns={2}>
              <EuiFlexItem>Name:</EuiFlexItem>
              <EuiFlexItem>{data?.name}</EuiFlexItem>
              <EuiFlexItem>description:</EuiFlexItem>
              <EuiFlexItem>{data?.description}</EuiFlexItem>
              <EuiFlexItem>Created date :</EuiFlexItem>
              <EuiFlexItem>{moment(data?.created_at).format("YYYY-MM-DD hh:mm:ss")}</EuiFlexItem>
              <EuiFlexItem>Updated date :</EuiFlexItem>
              <EuiFlexItem>{moment(data?.updated_at).format("YYYY-MM-DD hh:mm:ss")}</EuiFlexItem>
            </EuiFlexGrid>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </div>
  );
};

export default GeneralDetails;
