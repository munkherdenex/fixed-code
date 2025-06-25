import React, { useEffect, useState } from "react";
import {
  EuiAvatar,
  EuiBadge,
  EuiButton,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  EuiPanel,
  EuiTitle,
  EuiButtonEmpty,
  EuiHorizontalRule,
  EuiText,
} from "@elastic/eui";
import { useChatContext } from "@/contexts/ChatContext";
import { getImgUrl } from "./utils";
import useGetCustomers, { CustomersResponse } from "@/hooks/useGetCustomers";
import { PAGINATION_CHOOSES } from "@/constants";
import contactLogApi from "@/api/contact_log";
import CustomersSelect from "../ticket_template/customers_select";
import useSWR from "swr";
import audienceApi from "@/api/audience";
import { useRouter } from "next/router";

interface ChatDetailProps {
  className?: string;
}

const ChatDetail: React.FC<ChatDetailProps> = ({ className }) => {
  const router = useRouter();
  const {
    selectedChatFbProfile,
    selectedPageId,
    selectedChatId,
    setSelectedChatId,
    setSelectedPageId,
    currentRootChatTab,
    setCurrentRootChatTab,
    loadMoreRootChats,
  } = useChatContext();
  const [selectedOptions, setSelectedOptions] = useState<EuiComboBoxOptionOption[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isClosingChat, setIsClosingChat] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const { data: segmentCustomers } = useGetCustomers<CustomersResponse>(null, {
    limit: `${PAGINATION_CHOOSES[3]}`,
  });

  // Use SWR for fetching customer data
  const {
    data: customerData,
    error,
    isLoading,
  } = useSWR(
    selectedChatFbProfile && selectedChatFbProfile?.customer_id
      ? [`/customer/${selectedChatFbProfile?.customer_id}`, selectedChatFbProfile?.customer_id]
      : null,
    async () => {
      const response = await audienceApi.getAudience([
        null,
        { id: selectedChatFbProfile?.customer_id },
      ]);
      return response;
    },
  );

  // If no chat is selected, show placeholder
  if (!selectedChatFbProfile) {
    return (
      <div className={className} style={{ padding: "20px" }}>
        <EuiPanel>
          <EuiTitle size="s">
            <h3>Харилцагчийн мэдээлэл</h3>
          </EuiTitle>
          <EuiSpacer size="m" />
          <p>Сонгосон чатын харилцагчийн тухай мэдээлэл</p>
        </EuiPanel>
      </div>
    );
  }

  const dataTypeOptions: EuiComboBoxOptionOption[] =
    segmentCustomers?.results?.map((customer) => {
      return {
        label: customer?.email || customer?.phone || customer?.rid,
        "aria-label": `${customer?.email} ${customer?.phone} ${customer?.rid}`,
        value: String(customer?.id),
        append: <EuiBadge>{customer?.phone || customer?.email || customer?.rid}</EuiBadge>,
      };
    }) || [];

  const handleAssignButton = async () => {
    if (!selectedCustomerId || !selectedChatFbProfile) return;

    const customerId = selectedCustomerId;
    try {
      setIsAssigning(true);
      await contactLogApi.assignPsidToCustomer({
        psid: selectedChatFbProfile.psid,
        customer_id: customerId,
      });
      // Could add success notification here
    } catch (error) {
      console.error("Error assigning customer:", error);
      // Could add error notification here
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCloseChat = async () => {
    if (!selectedChatId) return;

    try {
      setIsClosingChat(true);

      // First update the server
      await contactLogApi.updateContactLogById(selectedChatId, undefined, "archive");

      // Force an immediate update to the chat list - we need to move to archive tab
      setCurrentRootChatTab("closed-chats-tab");

      // Clear selected chat after closing it
      setSelectedChatId(null);
      setSelectedPageId(null);
      setSelectedChatFbProfile(null);

      // Short timeout to ensure the tab switch completes
      setTimeout(() => {
        // Force a refresh of the chat list
        loadMoreRootChats();
      }, 100);
    } catch (error) {
      console.error("Error closing chat:", error);
    } finally {
      setIsClosingChat(false);
    }
  };

  const onChange = (selectedOptions: EuiComboBoxOptionOption[]) => {
    setSelectedOptions(selectedOptions);
  };

  const onCustomerSelect = (value) => {
    setSelectedCustomerId(value);
  };

  return (
    <div className={className} style={{ padding: "20px" }}>
      <EuiPanel hasBorder={true} hasShadow={false}>
        <EuiFlexGroup alignItems="center" gutterSize="m">
          <EuiFlexItem grow={false}>
            <EuiAvatar
              size="l"
              name={selectedChatFbProfile?.name || "-"}
              imageUrl={getImgUrl(selectedChatFbProfile?.picture)}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <h4>{selectedChatFbProfile?.name}</h4>
            <p>PSID: {selectedChatFbProfile?.psid}</p>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size="m" />

        <EuiButton
          color="danger"
          onClick={handleCloseChat}
          isLoading={isClosingChat}
          iconType="cross"
        >
          Чатыг хаах
        </EuiButton>
      </EuiPanel>

      <EuiSpacer size="l" />

      <EuiPanel>
        {customerData ? (
          <>
            <EuiFlexGroup direction="column" justifyContent="flexStart" alignItems="center">
              <EuiFlexItem grow={true}>
                <EuiText grow={false}>
                  <h3>{customerData.name + " " + customerData.surname}</h3>
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size="l"></EuiSpacer>
            <EuiFlexGroup direction="column" justifyContent="flexStart" alignItems="flexStart">
              <EuiFlexItem grow={false}>И-мэйл хаяг: {customerData.email}</EuiFlexItem>
              <EuiFlexItem grow={false}>Утасны дугаар: {customerData.phone}</EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup>
                  <EuiText grow={false}>Subscription: </EuiText>
                  <EuiBadge color={customerData.is_subscribed ? "success" : "danger"}>
                    {customerData.is_subscribed ? "Тийм" : "Үгүй"}
                  </EuiBadge>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup>
                  <EuiText grow={false}>Төлөв: </EuiText>
                  <EuiBadge color={customerData.status == "active" ? "success" : "danger"}>
                    {customerData.status == "active" ? "Идэвхтэй" : "Идэвхгүй"}
                  </EuiBadge>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>Үүсгэсэн: {customerData.created_by.email}</EuiFlexItem>
              <EuiFlexItem grow={false}>Шинэчилсэн: {customerData.updated_by.email}</EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size="l"></EuiSpacer>
            <EuiFlexGroup direction="column" justifyContent="flexStart" alignItems="center">
              <EuiFlexItem grow={true}>
                <EuiButton
                  color="danger"
                  fill
                  iconType="arrowRight"
                  iconSide="right"
                  onClick={() =>
                    router.push({
                      pathname: `/dashboards/crm/customer/info/${customerData.id}`,
                    })
                  }
                >
                  Дэлгэрэнгүй
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </>
        ) : (
          <EuiForm>
            <EuiFormRow label="Харилцагч холбох" fullWidth>
              {/* <EuiComboBox
              placeholder="Харилцагч хайх"
              options={dataTypeOptions}
              selectedOptions={selectedOptions}
              onChange={onChange}
              singleSelection={{ asPlainText: true }}
              fullWidth
            /> */}

              <CustomersSelect
                onSelect={onCustomerSelect}
                isLoading={undefined}
                isDisabled={undefined}
                initValue={undefined}
              />
            </EuiFormRow>
            <EuiSpacer size="m" />
            <EuiButton
              onClick={handleAssignButton}
              fill
              isLoading={isAssigning}
              isDisabled={selectedCustomerId == null}
            >
              Холбох
            </EuiButton>
          </EuiForm>
        )}
      </EuiPanel>
    </div>
  );
};

export default ChatDetail;
