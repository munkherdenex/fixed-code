import { EuiButton, EuiFlexGroup, EuiPopover } from "@elastic/eui";
import { useContext, useState } from "react";
import { dashboardHeadersStyles } from "../../layouts/dashboard_headers.style";
import { teamsContext } from "../../store/teams_store";
import TeamsTreeView from "../management/teams_tree_view";

const TeamSwitcher = () => {
  const styles = dashboardHeadersStyles();
  const { currentTeam, teams } = useContext(teamsContext);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const onButtonClick = () => setIsPopoverOpen((isPopoverOpen) => !isPopoverOpen);
  const closePopover = () => setIsPopoverOpen(false);

  const button = (
    <EuiButton
      fullWidth
      size="s"
      color="text"
      iconType="arrowDown"
      iconSide="right"
      css={styles.popover}
      onClick={onButtonClick}
    >
      {currentTeam?.name || "Select team"}
    </EuiButton>
  );

  if (teams?.length === 0) {
    return <></>;
  }

  return (
    <EuiPopover
      button={button}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      anchorPosition="downLeft"
      panelPaddingSize="s"
      css={styles.popover}
    >
      <EuiFlexGroup direction="column" gutterSize="s">
        <TeamsTreeView />
      </EuiFlexGroup>
    </EuiPopover>
  );
};

export default TeamSwitcher;
