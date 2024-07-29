import React from "react";
import { EuiButtonIcon, EuiFlexGrid, EuiFlexGroup, EuiFlexItem, EuiPanel } from "@elastic/eui";
import moment from "moment";
import { useRouter } from "next/router";
import { useState } from "react";
import useGetCustomers, { CustomersType } from "../../hooks/useGetCustomers";
import useGetFields, { Fields } from "../../hooks/useGetFields";
import AddSegmentsToAudience from "./add_segment_to_audience";
import DeleteCustomerModal from "./delete_customer_modal";
import UpdateCustomerComponent from "./update_customer";

const GeneralDetails = () => {
  const router = useRouter();
  const { data, isLoading } = useGetCustomers<CustomersType>(router.query.id, {
    extended: "true",
  });
  const { data: fields } = useGetFields<Fields[]>(undefined, {
    all: "true",
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSegmentFlyoutVisible, setIsSegmentFlyoutVisible] = useState(false);
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  const extendedCustomerData = fields
    ?.map((field) => ({
      ...field,
      value: data?.customer_data ? data.customer_data[field.attribute_name] : undefined,
    }))
    .filter((data) => data.value !== undefined);

  if (isLoading) return <div>Loading...</div>;

  return (
    <EuiPanel>
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiPanel paddingSize="s" color="subdued">
            <EuiFlexGroup responsive={false} justifyContent="spaceBetween" alignItems="center">
              <EuiFlexItem grow={false}>
                <strong>Audience details</strong>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGrid responsive={false} gutterSize="s" columns={3}>
                  <EuiFlexItem grow={false}>
                    <EuiButtonIcon
                      display="base"
                      iconType="listAdd"
                      aria-label="Add"
                      color="success"
                      onClick={() => setIsSegmentFlyoutVisible(true)}
                    />
                  </EuiFlexItem>
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
          <EuiFlexGrid responsive={false} columns={2}>
            <EuiFlexItem>Email address :</EuiFlexItem>
            <EuiFlexItem>{data?.email}</EuiFlexItem>
            <EuiFlexItem>Phone number :</EuiFlexItem>
            <EuiFlexItem>{data?.phone}</EuiFlexItem>
            <EuiFlexItem>Reference ID :</EuiFlexItem>
            <EuiFlexItem> {data?.rid}</EuiFlexItem>
            <EuiFlexItem>Created date :</EuiFlexItem>
            <EuiFlexItem>{moment(data?.created_at).format("YYYY-MM-DD LT")}</EuiFlexItem>
            <EuiFlexItem>Updated date :</EuiFlexItem>
            <EuiFlexItem> {moment(data?.updated_at).format("YYYY-MM-DD LT")}</EuiFlexItem>
          </EuiFlexGrid>
        </EuiFlexItem>
        {extendedCustomerData && extendedCustomerData?.length > 0 && (
          <>
            <EuiFlexItem>
              <EuiPanel paddingSize="s" color="subdued">
                <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
                  <EuiFlexItem grow={false}>
                    <strong>Custom attributes</strong>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiPanel>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFlexGrid responsive={false} columns={2}>
                {extendedCustomerData?.map((data) => (
                  <React.Fragment key={data.id}>
                    <EuiFlexItem>
                      {data.name} ({data.attribute_name}) :
                    </EuiFlexItem>
                    {moment(data.value, "YYYY-MM-DD HH:mm", true).isValid() ? (
                      <EuiFlexItem>
                        {data.data_type === "date" && moment(data.value).format("YYYY-MM-DD")}
                        {data.data_type === "datetime" &&
                          moment(data.value).format("YYYY-MM-DD LT")}
                      </EuiFlexItem>
                    ) : (
                      <EuiFlexItem>{data.value}</EuiFlexItem>
                    )}
                  </React.Fragment>
                ))}
              </EuiFlexGrid>
            </EuiFlexItem>
          </>
        )}
      </EuiFlexGroup>
      {isModalVisible && <DeleteCustomerModal setIsModalVisible={setIsModalVisible} />}
      {isSegmentFlyoutVisible && (
        <AddSegmentsToAudience setIsFlyoutVisible={setIsSegmentFlyoutVisible} />
      )}
      {isFlyoutVisible && <UpdateCustomerComponent setIsFlyoutVisible={setIsFlyoutVisible} />}
    </EuiPanel>
  );
};

export default GeneralDetails;
