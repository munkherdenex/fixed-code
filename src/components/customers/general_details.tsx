import React, { useContext } from "react";
import {
  EuiBadge,
  EuiButtonIcon,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiPanel,
  EuiSkeletonRectangle,
  EuiSwitch,
  EuiTextColor,
} from "@elastic/eui";
import moment from "moment";
import { useState } from "react";
import useGetFields, { Fields } from "../../hooks/useGetFields";
import AddSegmentsToAudience from "./add_segment_to_audience";
import DeleteCustomerModal from "./delete_customer_modal";
import UpdateCustomerComponent from "./update_customer";
import AdminComponent from "../admin_component";
import { useTranslations } from "next-intl";
import { badgeColor } from "../../utils/badge_color";
import { useAudienceContext } from "../../store/audience_store";
import useAddTestCustomer from "../../hooks/useAddTestCustomer";
import useRemoveTestCustomer from "../../hooks/useRemoveTestCustomer";
import { teamsContext } from "../../store/teams_store";
import { addToast } from '../toast';

const GeneralDetails = () => {
  const audientT = useTranslations();

  const { isAdmin, isAccountActive } = useContext(teamsContext);
  const { data, isLoading } = useAudienceContext();
  const { data: fields } = useGetFields<Fields[]>(undefined, {
    all: "true",
  });
  const { addTestCustomerTrigger } = useAddTestCustomer(data);
  const { removeTestCustomerTrigger } = useRemoveTestCustomer(data);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSegmentFlyoutVisible, setIsSegmentFlyoutVisible] = useState(false);
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  const extendedCustomerData =
    Array.isArray(fields) &&
    fields
      ?.map((field) => ({
        ...field,
        value: data?.customer_data ? data?.customer_data[field.attribute_name] : undefined,
      }))
      .filter((data) => data?.value !== undefined);

  return (
    <div>
      <EuiPanel>
        <EuiSkeletonRectangle isLoading={isLoading} width="100%" height={655} borderRadius="m">
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <EuiPanel paddingSize="s" color="subdued">
                <EuiFlexGroup responsive={false} justifyContent="spaceBetween" alignItems="center">
                  <EuiFlexItem grow={false}>
                    <strong>{audientT("audience-details")}</strong>
                  </EuiFlexItem>
                  <AdminComponent>
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
                            iconType="pencil"
                            aria-label="Update"
                            color="primary"
                            onClick={() => setIsFlyoutVisible(true)}
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
                      </EuiFlexGrid>
                    </EuiFlexItem>
                  </AdminComponent>
                </EuiFlexGroup>
              </EuiPanel>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFlexGrid responsive={false} columns={2}>
                <EuiFlexItem>{audientT("email-address")} :</EuiFlexItem>
                <EuiFlexItem>
                  {data?.email ? data?.email : <EuiTextColor color="subdued">None</EuiTextColor>}
                </EuiFlexItem>
                <EuiFlexItem>{audientT("phone-number")} :</EuiFlexItem>
                <EuiFlexItem>
                  {data?.phone ? data?.phone : <EuiTextColor color="subdued">None</EuiTextColor>}
                </EuiFlexItem>
                <EuiFlexItem>{audientT("reference-id")} :</EuiFlexItem>
                <EuiFlexItem>
                  {data?.rid ? data?.rid : <EuiTextColor color="subdued">None</EuiTextColor>}
                </EuiFlexItem>

                <EuiFlexItem>{audientT("is-test-user")} :</EuiFlexItem>
                <EuiFlexItem>
                  <EuiFormRow error={audientT("only-admin-can-do")} isInvalid={true}>
                    <EuiSwitch
                      label={data?.is_test_user ? audientT("yes") : audientT("no")}
                      checked={data?.is_test_user}
                      onChange={() => {
                        if (isAdmin || !isAccountActive) {
                          return false
                        }

                        if (data?.is_test_user) {
                          const a = removeTestCustomerTrigger();
                          console.log("DEL", a);
                        } else {
                          const a = addTestCustomerTrigger();
                          console.log("POS", a);
                        }
                      }}
                      compressed
                    />
                  </EuiFormRow>
                </EuiFlexItem>

                <EuiFlexItem>{audientT("subscription-status")} :</EuiFlexItem>
                <EuiFlexItem>
                  <div>
                    <EuiBadge color={badgeColor(data?.is_subscribed.toString())}>
                      {data?.is_subscribed.toString().toUpperCase()}
                    </EuiBadge>
                  </div>
                </EuiFlexItem>
                {data?.last_clicked_at && (
                  <>
                    <EuiFlexItem>{audientT("last-clicked")} :</EuiFlexItem>
                    <EuiFlexItem>
                      {moment(data?.last_clicked_at).format("YYYY-MM-DD LT")}
                    </EuiFlexItem>
                  </>
                )}
                {data?.status && (
                  <>
                    <EuiFlexItem>{audientT("status")} :</EuiFlexItem>
                    <EuiFlexItem>
                      <div>
                        <EuiBadge color={badgeColor(data?.status)}>
                          {data?.status.toUpperCase()}
                        </EuiBadge>
                      </div>
                    </EuiFlexItem>
                  </>
                )}
                {data?.last_opened_at && (
                  <>
                    <EuiFlexItem>{audientT("last-opened")} :</EuiFlexItem>
                    <EuiFlexItem>
                      {moment(data?.last_opened_at).format("YYYY-MM-DD LT")}
                    </EuiFlexItem>
                  </>
                )}
                <EuiFlexItem>{audientT("created")} :</EuiFlexItem>
                <EuiFlexItem>
                  <div>{data?.created_by}</div>
                  <div>{moment(data?.created_at).format("YYYY-MM-DD LT")}</div>
                </EuiFlexItem>
                <EuiFlexItem>{audientT("updated")} :</EuiFlexItem>
                <EuiFlexItem>
                  <div>{data?.updated_by}</div>
                  <div>{moment(data?.updated_at).format("YYYY-MM-DD LT")}</div>
                </EuiFlexItem>
              </EuiFlexGrid>
            </EuiFlexItem>
            {extendedCustomerData && extendedCustomerData?.length > 0 && (
              <>
                <EuiFlexItem>
                  <EuiPanel paddingSize="s" color="subdued">
                    <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
                      <EuiFlexItem grow={false}>
                        <strong>{audientT("custom-attributes")}</strong>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiPanel>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFlexGrid responsive={false} columns={2}>
                    {extendedCustomerData?.map((data) => (
                      <React.Fragment key={data?.id}>
                        <EuiFlexItem>
                          {data?.name} ({data?.attribute_name}) :
                        </EuiFlexItem>
                        <EuiFlexItem>
                          {data?.data_type === "date" && moment(data?.value).format("YYYY-MM-DD")}
                          {data?.data_type === "datetime" &&
                            moment(data?.value).format("YYYY-MM-DD LT")}
                          {data?.data_type !== "date" &&
                            data?.data_type !== "datetime" &&
                            data?.value}
                        </EuiFlexItem>
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
        </EuiSkeletonRectangle>
      </EuiPanel>
    </div>
  );
};

export default GeneralDetails;
