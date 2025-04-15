import audienceApi from "@/api/audience";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiDescriptionList,
  EuiEmptyPrompt,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiPanel,
  EuiSkeletonRectangle,
  EuiSplitPanel,
  EuiTitle,
} from "@elastic/eui";
import React, { useState } from "react";
import useSWR from "swr";
import GeneralDetails from '../customers/general_details';

const CustomerPanel: React.FC<{
  customerId?: number;
  phone?: string;
  email?: string;
  rid?: string;
}> = ({ customerId, phone, email, rid }) => {
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  // Use SWR for fetching customer data
  const {
    data: customerData,
    error,
    isLoading,
  } = useSWR(customerId ? [`/audience/${customerId}`, customerId] : null, async () => {
    const response = await audienceApi.getAudience([null, { id: customerId }]);
    return response;
  });

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
          {customerData && (
            <EuiDescriptionList
              listItems={[
                {
                  title: "Утасны дугаар",
                  description: customerData.phone || "Утасны дугаар байхгүй",
                },
                { title: "Имэйл", description: customerData.email || "Имэйл байхгүй" },
                { title: "RID", description: customerData.rid || "RID байхгүй" },
              ]}
              type="column"
              columnGutterSize="m"
            />
          )}
          {!customerData && !error && (
            <EuiEmptyPrompt
              titleSize="xs"
              iconType="user"
              body={<p>Тохирох хэрэглэгч олдсонгүй.</p>}
            />
          )}
        </EuiPanel>
      </EuiSkeletonRectangle>
      {customerData && (
        <EuiSplitPanel.Inner color="subdued" paddingSize="m">
          <EuiButton onClick={() => setIsFlyoutVisible(true)} size="s" color="text">
            Дэлгэрэнгүй
          </EuiButton>
          {isFlyoutVisible && (
            <EuiFlyout
              onClose={() => setIsFlyoutVisible(false)}
              size="m"
              aria-labelledby="customerDetailsFlyout"
            >
              <EuiFlyoutHeader hasBorder>
                <EuiTitle size="m">
                  <h2 id="customerDetailsFlyout">Хэрэглэгчийн дэлгэрэнгүй мэдээлэл</h2>
                </EuiTitle>
              </EuiFlyoutHeader>
              <EuiFlyoutBody>
                <GeneralDetails />
              </EuiFlyoutBody>
            </EuiFlyout>
          )}
        </EuiSplitPanel.Inner>
      )}
    </EuiSplitPanel.Outer>
  );
};

export default CustomerPanel;
