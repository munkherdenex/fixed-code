import React from 'react';
import {
  EuiContextMenu,
  EuiLoadingSpinner,
  EuiPopover
} from '@elastic/eui';
import { useChatContext, ChatGroup } from '@/contexts/ChatContext';

interface ChatGroupSelectionProps {
  className?: string;
}

// Separated styles
const styles = {
  container: {
    backgroundColor: "#F5F7FA",
    borderRadius: "12px",
    background: "#F7F8FC",
    boxShadow: "0px 0.7px 1.4px 0px rgba(0, 0, 0, 0.07), 0px 1.9px 4px 0px rgba(0, 0, 0, 0.05), 0px 4.5px 10px 0px rgba(0, 0, 0, 0.05)",
    padding: "10px", 
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    width: "calc(100% - 24px)",
    margin: "12px",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  containerHover: {
    transform: "translateY(-2px)",
    boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.1), 0px 3px 6px 0px rgba(0, 0, 0, 0.08), 0px 5px 12px 0px rgba(0, 0, 0, 0.06)",
  },
  leftSection: {
    display: "flex", 
    alignItems: "center"
  },
  avatar: {
    width: "40px", 
    height: "40px", 
    borderRadius: "50%", 
    backgroundColor: "#F05252", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center",
    marginRight: "15px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
  },
  avatarText: {
    color: "white", 
    fontWeight: "bold", 
    fontSize: "18px"
  },
  groupName: {
    fontWeight: "bold", 
    fontSize: "16px"
  },
  countSection: {
    display: "flex", 
    alignItems: "center", 
    color: "#69707D", 
    fontSize: "14px"
  },
  countLabel: {
    marginRight: "5px"
  },
  countBadge: {
    backgroundColor: "#D3DAE6", 
    borderRadius: "4px", 
    padding: "1px 6px",
    fontSize: "12px"
  },
  dropdownIcon: {
    fontSize: "20px"
  }
};

const ChatGroupSelection: React.FC<ChatGroupSelectionProps> = ({ className }) => {
  const {
    chatGroups,
    selectedChatGroup,
    isLoadingChatGroups,
    setSelectedChatGroup,
    currentRootChatTab,
    setCurrentRootChatTab,
    setSourceId,
    setSelectedChatId,
    setSelectedPageId,
    setSelectedChatFbProfile,
    setMessage,
    mutateMessages
  } = useChatContext();
  
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  const handleSelectChatGroup = (chatGroup: ChatGroup) => {
    setSelectedChatGroup(chatGroup);
    // Set the source_id to be used when loading rootChatLogs
    // When "all" is selected, pass null to load all sources
    const sourceId = chatGroup.id === 'all' ? null : chatGroup.id;
    // Update the source_id in context for loading chat logs
    setSourceId(sourceId);
    
    // Reset the selected chat profile and messages when changing chat groups
    setSelectedChatId(null);
    setSelectedPageId(null);
    setSelectedChatFbProfile(null);
    setMessage("");
    mutateMessages();
    
    // Force refresh by resetting the current tab
    setCurrentRootChatTab(currentRootChatTab);
    closePopover();
  };

  // Create panels for context menu
  const panels = [
    {
      id: 0,
      items: chatGroups.map((group) => ({
        name: group.name,
        icon: group.type === 'facebook' ? 'logoFacebook' : 'letter',
        onClick: () => handleSelectChatGroup(group),
      })),
    },
  ];

  // Create button for chat groups popover
  const selectPageButton = (
    <div 
      style={{
        ...styles.container,
        ...(isHovered ? styles.containerHover : {})
      }}
      onClick={togglePopover}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.leftSection}>
        <div style={styles.avatar}>
          <span style={styles.avatarText}>P</span>
        </div>
        <div>
          <div style={styles.groupName}>
            {selectedChatGroup ? selectedChatGroup.name : 'Select Chat Group'}
          </div>
          <div style={styles.countSection}>
            <span style={styles.countLabel}>Бүгд</span>
            <span style={styles.countBadge}>
              {chatGroups.length > 0 ? chatGroups.length - 1 : 0}
            </span>
          </div>
        </div>
      </div>
      <div>
        {isLoadingChatGroups ? (
          <EuiLoadingSpinner size="m" />
        ) : (
          <span style={styles.dropdownIcon}>▼</span>
        )}
      </div>
    </div>
  );

  return (
    <EuiPopover
      id="chatGroupSelectionPopover"
      button={selectPageButton}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      panelPaddingSize="none"
      anchorPosition="downLeft"
    >
      <EuiContextMenu initialPanelId={0} panels={panels} size='m'/>
    </EuiPopover>
  );
};

export default ChatGroupSelection;