import {
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
} from "@elastic/eui";
import useGetCustomers from "../../hooks/useGetCustomers";
import { useRouter } from "next/router";
import moment from "moment";

const GeneralDetails = () => {
  const router = useRouter();
  const { detailData } = useGetCustomers(router.query.id);

  return (
    <div>
      <EuiPanel>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <EuiPanel paddingSize="s" color="transparent">
              <strong>Customer details</strong>
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGrid columns={2}>
              <EuiFlexItem >Email address :</EuiFlexItem>
              <EuiFlexItem>
                {String(detailData?.email)}
              </EuiFlexItem>
              <EuiFlexItem>Phone number :</EuiFlexItem>
              <EuiFlexItem>{String(detailData?.phone)}</EuiFlexItem>
              <EuiFlexItem>Created date :</EuiFlexItem>
              <EuiFlexItem>{moment(detailData?.created_at).format('YYYY-MM-DD')}</EuiFlexItem>
              <EuiFlexItem >Updated date :</EuiFlexItem>
              <EuiFlexItem> {moment(detailData?.updated_at).format('YYYY-MM-DD')}</EuiFlexItem>
            </EuiFlexGrid>
            <EuiSpacer size="xl" />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </div >
  );
};

export default GeneralDetails;
