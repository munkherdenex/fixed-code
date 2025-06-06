import React, { useState } from "react";
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
} from "@elastic/eui";
import { useChatContext } from "@/contexts/ChatContext";
import { getImgUrl } from "./utils";
import useGetCustomers, { CustomersResponse } from "@/hooks/useGetCustomers";
import { PAGINATION_CHOOSES } from "@/constants";
import contactLogApi from "@/api/contact_log";

interface ChatDetailProps {
  className?: string;
}

const ChatDetail: React.FC<ChatDetailProps> = ({ className }) => {
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

  const { data: segmentCustomers } = useGetCustomers<CustomersResponse>(null, {
    limit: `${PAGINATION_CHOOSES[3]}`,
  });

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
    if (!selectedOptions.length || !selectedChatFbProfile) return;

    const customerId = selectedOptions[0].value;
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
      setCurrentRootChatTab('closed-chats-tab');
      
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
        <EuiForm>
          <EuiFormRow label="Харилцагч холбох" fullWidth>
            <EuiComboBox
              placeholder="Харилцагч хайх"
              options={dataTypeOptions}
              selectedOptions={selectedOptions}
              onChange={onChange}
              singleSelection={{ asPlainText: true }}
              fullWidth
            />
          </EuiFormRow>
          <EuiSpacer size="m" />
          <EuiButton
            onClick={handleAssignButton}
            fill
            isLoading={isAssigning}
            isDisabled={!selectedOptions.length}
          >
            Холбох
          </EuiButton>
        </EuiForm>
      </EuiPanel>
    </div>
  );
};

export default ChatDetail;
