import {
  EuiBadge,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPanel,
} from "@elastic/eui";
import moment from "moment";
import { useRouter } from "next/router";
import useGetSegments, { Segment } from "../../hooks/useGetSegments";

const GeneralDetails = () => {
  const router = useRouter();
  const { data, isLoading } = useGetSegments<Segment>(router.query.id);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data</div>;
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
              <EuiHorizontalRule margin="none" />
              <EuiFlexItem>description:</EuiFlexItem>
              <EuiFlexItem>{data?.description}</EuiFlexItem>
              <EuiHorizontalRule margin="none" />
              <EuiFlexItem>Type:</EuiFlexItem>
              <EuiFlexItem>
                <div>
                  <EuiBadge>{data?.type}</EuiBadge>
                </div>
              </EuiFlexItem>
              <EuiHorizontalRule margin="none" />
              <EuiFlexItem>Created date :</EuiFlexItem>
              <EuiFlexItem>{moment(data?.created_at).format("YYYY-MM-DD hh:mm:ss")}</EuiFlexItem>
              <EuiHorizontalRule margin="none" />
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
