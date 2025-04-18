import audienceApi from "@/api/audience";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiDescriptionList,
  EuiEmptyPrompt,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiIcon,
  EuiPanel,
  EuiSkeletonRectangle,
  EuiSplitPanel,
  EuiTitle,
} from "@elastic/eui";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import GeneralDetails from "../customers/general_details";

const CustomerPanel: React.FC<{
  customerId?: number;
  phone?: string;
  email?: string;
  rid?: string;
}> = ({ customerId, phone, email, rid }) => {
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const [customerDetail, setCustomerDetail] = useState(null);

  // Use SWR for fetching customer data
  const {
    data: customerData,
    error,
    isLoading,
  } = useSWR(customerId ? [`/customer/${customerId}`, customerId] : null, async () => {
    const response = await audienceApi.getAudience([null, { id: customerId }]);
    return response;
  });

  const {
    data: customerDataByPhone,
    error: errorLoadingByPhone,
    isLoading: isLoadingByPhone,
  } = useSWR(!customerId && phone ? [`/customers/?phone=${phone}`, phone] : null, async () => {
    const response = await audienceApi.getAudiences({ phone: phone });
    return response;
  });

  useEffect(() => {
    setCustomerDetail(customerData || customerDataByPhone?.data?.results[0]);
  }, [customerData, customerDataByPhone]);

  return (
    <EuiSplitPanel.Outer hasShadow={false} hasBorder>
      <EuiSplitPanel.Inner color="subdued" paddingSize="m">
        Хэрэглэгчийн мэдээлэл
      </EuiSplitPanel.Inner>
      <EuiSkeletonRectangle
        isLoading={isLoading}
        contentAriaLabel="Хэрэглэгчийн мэдээлэл"
        width={500}
        height={100}
        borderRadius="m"
      >
        <EuiPanel hasShadow={false}>
          {error && (
            <EuiEmptyPrompt
              titleSize="xs"
              iconType="user"
              body={<p>Хэрэглэгчийн мэдээллийг ачааллахад алдаа гарлаа.</p>}
            />
          )}
          {customerDetail && (
            <EuiDescriptionList
              listItems={[
                {
                  title: "Утасны дугаар",
                  description: customerDetail.phone || "Утасны дугаар байхгүй",
                },
                { title: "Имэйл", description: customerDetail.email || "Имэйл байхгүй" },
                { title: "RID", description: customerDetail.rid || "RID байхгүй" },
              ]}
              type="column"
              columnGutterSize="m"
            />
          )}
          {!customerDetail && (!error || !errorLoadingByPhone) && (
            <EuiEmptyPrompt
              titleSize="xs"
              iconType="user"
              body={<p>Тохирох хэрэглэгч олдсонгүй.</p>}
            />
          )}
        </EuiPanel>
      </EuiSkeletonRectangle>
      {customerDetail && (
        <EuiSplitPanel.Inner color="subdued" paddingSize="m">
          <EuiButtonEmpty href={`/dashboards/cdp/audience/info/${customerDetail.id}`} target="_blank" size="s" color="text">
            Дэлгэрэнгүй {' '}
            <EuiIcon type="popout" />
          </EuiButtonEmpty>
        </EuiSplitPanel.Inner>
      )}
    </EuiSplitPanel.Outer>
  );
};

export default CustomerPanel;
