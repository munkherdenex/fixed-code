import { EuiButton, EuiFlexGroup, EuiPopover, useIsWithinMaxBreakpoint } from "@elastic/eui";
import { useContext, useState } from "react";
import { dashboardHeadersStyles } from "../../layouts/dashboard_headers.style";
import { teamsContext } from "../../store/teams_store";
import TeamsTreeView from "../management/teams_tree_view";

const TeamSwitcher = () => {
  const styles = dashboardHeadersStyles();
  const largeMaxBreakpoint = useIsWithinMaxBreakpoint("s");
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
      css={largeMaxBreakpoint ? styles.popover : null}
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
    >
      <EuiFlexGroup direction="column" gutterSize="s">
        <TeamsTreeView />
      </EuiFlexGroup>
    </EuiPopover>
  );
};

export default TeamSwitcher;
