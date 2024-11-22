import {
  useEuiTheme,
  useGeneratedHtmlId,
  EuiButton,
  EuiPopover,
  EuiContextMenuPanel,
  EuiContextMenuItem,
  useIsWithinMaxBreakpoint,
} from "@elastic/eui";
import { css } from "@emotion/react";
import { useRouter } from "next/router";
import { useContext, useState, useMemo } from "react";
import { teamsContext } from "../../store/teams_store";
import { commonStyles } from "../../styles/global.styles";

const managementPaths = [
  {
    path: "/dashboards/cdp/custom_attribute",
    name: "Custom attributes",
    roles: ["admin", "manager"],
  },
  {
    path: "/dashboards/cdp/channels",
    name: "Channels",
    roles: ["admin"],
  },
];

const SideMenu = () => {
  const router = useRouter();
  const common = commonStyles();
  const { euiTheme } = useEuiTheme();
  const { myProfile } = useContext(teamsContext);
  const largeMaxBreakpoint = useIsWithinMaxBreakpoint("l");

  const [isPopoverOpen, setPopover] = useState(false);

  const customContextMenuPopoverId = useGeneratedHtmlId({
    prefix: "customContextMenuPopover",
  });

  const managementPathsFiltered = useMemo(
    () =>
      managementPaths?.filter((path) => {
        return path.roles ? path.roles.includes(myProfile?.role) : true;
      }),
    [myProfile?.role],
  );

  const onButtonClick = () => {
    setPopover(!isPopoverOpen);
  };

  const closePopover = () => {
    setPopover(false);
  };

  const button = (
    <EuiButton
      css={css`
        border: ${euiTheme.border.thin};
      `}
      fullWidth
      size="s"
      iconType="arrowUp"
      iconSide="right"
      color="text"
      onClick={onButtonClick}
    >
      Management
    </EuiButton>
  );

  if (managementPathsFiltered.length === 0) {
    return null;
  }

  return (
    <EuiPopover
      id={customContextMenuPopoverId}
      button={button}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      panelPaddingSize="none"
      anchorPosition="upLeft"
      style={{
        width: "100%",
      }}
    >
      <EuiContextMenuPanel>
        {managementPathsFiltered.map((path) => {
          return (
            <EuiContextMenuItem
              css={largeMaxBreakpoint ? common.width305 : common.width200}
              key={path.name}
              size="s"
              onClick={() => {
                closePopover();
                router.push(path.path);
              }}
            >
              <div>{path.name}</div>
            </EuiContextMenuItem>
          );
        })}
      </EuiContextMenuPanel>
    </EuiPopover>
  );
};

export default SideMenu;
