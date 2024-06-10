import {
  EuiButton,
  EuiContextMenu,
  EuiFormRow,
  EuiIcon,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiPopover,
  EuiSpacer,
  EuiSwitch,
  useEuiTheme,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { useState } from "react";
import SettingsMenu from "./settings_menu";
import { teamContextMenuStyles } from "./team_context_menu.styles";

const TeamContextMenu = () => {
  const { euiTheme } = useEuiTheme();
  const styles = teamContextMenuStyles(euiTheme);
  const [isPopoverOpen, setPopover] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const closeModal = () => setIsModalVisible(false);
  const showModal = () => setIsModalVisible(true);

  const modalTitleId = useGeneratedHtmlId();

  const embeddedCodeSwitchId__1 = useGeneratedHtmlId({
    prefix: "embeddedCodeSwitch",
    suffix: "first",
  });
  const embeddedCodeSwitchId__2 = useGeneratedHtmlId({
    prefix: "embeddedCodeSwitch",
    suffix: "second",
  });
  const contextMenuPopoverId = useGeneratedHtmlId({
    prefix: "contextMenuPopover",
  });

  const onButtonClick = () => {
    setPopover(!isPopoverOpen);
  };

  const closePopover = () => {
    setPopover(false);
  };

  const panels = [
    {
      id: 0,
      title: "This is a context menu",
      items: [
        {
          name: "Open settings",
          icon: "gear",
          onClick: showModal,
        },
        {
          name: "Go to a link",
          icon: "user",
          href: "http://elastic.co",
          target: "_blank",
        },
        {
          name: "Nest panels",
          icon: "wrench",
          panel: 1,
        },
        {
          name: "Add a tooltip",
          icon: "document",
          toolTipContent: "Optional content for a tooltip",
          toolTipProps: {
            title: "Optional tooltip title",
            position: "right",
          },
          onClick: closePopover,
        },
        {
          name: "Use an app icon",
          icon: "visualizeApp",
          onClick: closePopover,
        },
        {
          name: "Pass an icon as a component to customize it",
          icon: <EuiIcon type="trash" size="m" color="danger" />,
          onClick: closePopover,
        },
        {
          name: "Disabled option",
          icon: "user",
          toolTipContent: "For reasons, this item is disabled",
          toolTipProps: { position: "right" },
          disabled: true,
          onClick: closePopover,
        },
      ],
    },
    {
      id: 1,
      initialFocusedItemIndex: 1,
      title: "Nest panels",
      items: [
        {
          name: "PDF reports",
          icon: "user",
          onClick: closePopover,
        },
        {
          name: "Embed code",
          icon: "user",
          panel: 2,
        },
        {
          name: "Permalinks",
          icon: "user",
          onClick: closePopover,
        },
      ],
    },
    {
      id: 2,
      title: "Embed code",
      content: (
        <div style={{ padding: 16 }}>
          <EuiFormRow label="Generate a public snapshot?" hasChildLabel={false}>
            <EuiSwitch
              name="switch"
              id={embeddedCodeSwitchId__1}
              label="Snapshot data"
              checked={true}
              onChange={() => {}}
            />
          </EuiFormRow>
          <EuiFormRow label="Include the following in the embed" hasChildLabel={false}>
            <EuiSwitch
              name="switch"
              id={embeddedCodeSwitchId__2}
              label="Current time range"
              checked={true}
              onChange={() => {}}
            />
          </EuiFormRow>
          <EuiSpacer />
          <EuiButton fill>Copy iFrame code</EuiButton>
        </div>
      ),
    },
  ];

  const button = (
    <EuiButton fullWidth iconType="arrowDown" iconSide="right" onClick={onButtonClick} css={styles.menuButton}>
      Click me to load a context menu
    </EuiButton>
  );

  return (
    <>
      {isModalVisible && (
        <EuiModal aria-labelledby={modalTitleId} onClose={closeModal}>
          <EuiModalHeader>
            <EuiModalHeaderTitle id={modalTitleId}>Settings menu</EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <SettingsMenu />
          </EuiModalBody>
          <EuiModalFooter>
            <EuiButton onClick={closeModal} fill>
              Close
            </EuiButton>
          </EuiModalFooter>
        </EuiModal>
      )}
      <EuiPopover
        id={contextMenuPopoverId}
        button={button}
        isOpen={isPopoverOpen}
        closePopover={closePopover}
        panelPaddingSize="none"
        anchorPosition="downLeft"
        display="block"
        zIndex={6000}
      >
        <EuiContextMenu initialPanelId={0} panels={panels} />
      </EuiPopover>
    </>
  );
};

export default TeamContextMenu;
