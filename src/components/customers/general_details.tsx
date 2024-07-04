import {
  EuiButtonIcon,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPanel,
} from "@elastic/eui";
import useGetCustomers, { CustomersType } from "../../hooks/useGetCustomers";
import { useRouter } from "next/router";
import moment from "moment";
import { useState } from "react";
import UpdateCustomerComponent from "./update_customer";
import DeleteCustomerModal from "./delete_customer_modal";

const GeneralDetails = () => {
  const router = useRouter();
  const { data, isLoading } = useGetCustomers<CustomersType>(router.query.id);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  const customerData = data?.customer_data
    ? Object.entries(data.customer_data).map(([key, value]) => ({
      name: key,
      value,
    }))
    : [];

  if (isLoading) return <div>Loading...</div>;

  return (
    <EuiPanel>
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiPanel paddingSize="s" color="subdued">
            <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
              <EuiFlexItem grow={false}>
                <strong>Audience details</strong>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGrid gutterSize="s" columns={2}>
                  <EuiFlexItem grow={false}>
                    <EuiButtonIcon
                      display="base"
                      iconType="trash"
                      aria-label="Delete"
                      color="danger"
                      onClick={() => setIsModalVisible(true)}
                    />
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButtonIcon
                      display="base"
                      iconType="pencil"
                      aria-label="Update"
                      color="primary"
                      onClick={() => setIsFlyoutVisible(true)}
                    />
                  </EuiFlexItem>
                </EuiFlexGrid>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFlexGrid columns={2}>
            <EuiFlexItem>Email address :</EuiFlexItem>
            <EuiFlexItem>{data?.email}</EuiFlexItem>
            <EuiHorizontalRule margin="none" />
            <EuiFlexItem>Phone number :</EuiFlexItem>
            <EuiFlexItem>{data?.phone}</EuiFlexItem>
            <EuiHorizontalRule margin="none" />
            <EuiFlexItem>Reference ID :</EuiFlexItem>
            <EuiFlexItem> {data?.rid}</EuiFlexItem>
            <EuiHorizontalRule margin="none" />
            <EuiFlexItem>Created date :</EuiFlexItem>
            <EuiFlexItem>{moment(data?.created_at).format("YYYY-MM-DD LT")}</EuiFlexItem>
            <EuiHorizontalRule margin="none" />
            <EuiFlexItem>Updated date :</EuiFlexItem>
            <EuiFlexItem> {moment(data?.updated_at).format("YYYY-MM-DD LT")}</EuiFlexItem>
            {customerData?.map((data) => (
              <>
                <EuiHorizontalRule margin="none" />
                <EuiFlexItem>{data.name} :</EuiFlexItem>
                <EuiFlexItem>{data.value}</EuiFlexItem>
              </>
            ))}
          </EuiFlexGrid>
        </EuiFlexItem>
      </EuiFlexGroup>
      {isModalVisible && <DeleteCustomerModal setIsModalVisible={setIsModalVisible} />}
      {isFlyoutVisible && <UpdateCustomerComponent setIsFlyoutVisible={setIsFlyoutVisible} />}
    </EuiPanel>
  );
};

export default GeneralDetails;
