import {
  EuiButtonIcon,
  EuiConfirmModal,
  EuiFieldText,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiHorizontalRule,
  EuiPanel,
} from "@elastic/eui";
import useGetCustomers from "../../hooks/useGetCustomers";
import { useRouter } from "next/router";
import moment from "moment";
import { useState } from "react";
import UpdateCustomerComponent from "./update_customer";
import { addToast } from "../toast";
import useDeleteCustomer from "../../hooks/useDeleteCustomer";

const pathPrefix = process.env.PATH_PREFIX;

const GeneralDetails = () => {
  const router = useRouter();
  const { detailData } = useGetCustomers(router.query.id);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const { customerDeleteTrigger } = useDeleteCustomer(router.query.id);
  const [deleteMessage, setDeleteMessage] = useState('');

  return (
    <EuiPanel>
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiPanel paddingSize="s" color="subdued">
            <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
              <EuiFlexItem grow={false}><strong>Customer details</strong></EuiFlexItem>
              <EuiFlexItem grow={false} >
                <EuiFlexGrid columns={2} >
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
            <EuiFlexItem >Email address :</EuiFlexItem>
            <EuiFlexItem>
              {detailData?.email}
            </EuiFlexItem>
            <EuiHorizontalRule margin="none" />
            <EuiFlexItem>Phone number :</EuiFlexItem>
            <EuiFlexItem>{detailData?.phone}</EuiFlexItem>
            <EuiHorizontalRule margin="none" />
            <EuiFlexItem>Created date :</EuiFlexItem>
            <EuiFlexItem>{moment(detailData?.created_at).format('YYYY-MM-DD LT')}</EuiFlexItem>
            <EuiHorizontalRule margin="none" />
            <EuiFlexItem >Updated date :</EuiFlexItem>
            <EuiFlexItem> {moment(detailData?.updated_at).format('YYYY-MM-DD LT')}</EuiFlexItem>
            <EuiHorizontalRule margin="none" />
            <EuiFlexItem >Reference ID :</EuiFlexItem>
            <EuiFlexItem> {detailData?.rid}</EuiFlexItem>
          </EuiFlexGrid>
        </EuiFlexItem>
      </EuiFlexGroup>

      {isModalVisible && (
        <EuiConfirmModal
          title="Warning"
          onCancel={() => setIsModalVisible(false)}
          confirmButtonDisabled={deleteMessage.toLowerCase() !== 'delete'}
          onConfirm={async () => {
            try {
              const response = await customerDeleteTrigger();
              if (response.ok) {
                router.push(`${pathPrefix}/dashboards/customers`);
                addToast({
                  id: "customer-deleted",
                  color: "success",
                  title: "Success",
                  text: "Successfully deleted",
                });
              }
            } catch (error) {
              console.error('ERROR:: ', error);
            }
          }}
          confirmButtonText="Delete"
          cancelButtonText="Cancel"
          buttonColor="danger"
        >
          <EuiFormRow label="Type the word 'delete' to confirm">
            <EuiFieldText
              name="delete"
              value={deleteMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setDeleteMessage(e.target.value);
              }}
            />
          </EuiFormRow>
        </EuiConfirmModal>
      )}
      {isFlyoutVisible && <UpdateCustomerComponent setIsFlyoutVisible={setIsFlyoutVisible} />}
    </EuiPanel>
  );
};

export default GeneralDetails;
