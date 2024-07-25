import {
  EuiAvatar,
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHeader,
  EuiHeaderLogo,
  EuiHeaderSectionItemButton,
  EuiPopover,
  EuiText,
  useGeneratedHtmlId,
  useIsWithinMaxBreakpoint,
} from "@elastic/eui";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { mutate } from "swr";
import ThemeSwitcher from "../components/chrome/theme_switcher";
import CollapsibleNav from "../components/dashboards/collapsible_nav";
import TeamsTreeView from "../components/management/teams_tree_view";
import useLogout from "../hooks/useLogout";
import { authContext } from "../store/auth_store";
import { teamsContext } from "../store/teams_store";
import { dashboardHeadersStyles } from "./dashboard_headers.style";

const pathPrefix = process.env.PATH_PREFIX;

const HeaderUserMenu = () => {
  const router = useRouter();
  const styles = dashboardHeadersStyles();
  const { user } = useContext(authContext);
  const { trigger } = useLogout();
  const headerUserPopoverId = useGeneratedHtmlId({
    prefix: "headerUserPopover",
  });

  const [isOpen, setIsOpen] = useState(false);

  const name = user?.fname && user?.lname ? `${user?.fname} ${user?.lname}` : user?.email || "";

  const onMenuButtonClick = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const button = (
    <EuiHeaderSectionItemButton
      aria-controls={headerUserPopoverId}
      aria-expanded={isOpen}
      aria-haspopup="true"
      aria-label="Account menu"
      onClick={onMenuButtonClick}
    >
      <EuiAvatar name={name} size="s" />
    </EuiHeaderSectionItemButton>
  );

  return (
    <EuiPopover
      id={headerUserPopoverId}
      button={button}
      isOpen={isOpen}
      anchorPosition="downRight"
      closePopover={closeMenu}
      panelPaddingSize="m"
    >
      <div style={{ width: 300 }}>
        <EuiFlexGroup gutterSize="m" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiAvatar name={name} size="xl" />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText css={styles.title}>
              <p>{name}</p>
            </EuiText>
            <EuiFlexGroup responsive={false}>
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty
                  onClick={() => router.push(`${pathPrefix}/dashboards/management/profile`)}
                >
                  Edit profile
                </EuiButtonEmpty>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty
                  onClick={async () => {
                    await trigger();
                    await mutate(() => true, undefined, { revalidate: false });
                    localStorage.removeItem("currentTeamId");
                    window.location.href = "/";
                  }}
                >
                  Log out
                </EuiButtonEmpty>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    </EuiPopover>
  );
};

const TeamSwitcher = () => {
  const router = useRouter();
  const styles = dashboardHeadersStyles();
  const { currentTeam } = useContext(teamsContext);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const onButtonClick = () => setIsPopoverOpen((isPopoverOpen) => !isPopoverOpen);
  const closePopover = () => setIsPopoverOpen(false);

  const button = (
    <EuiButtonEmpty
      size="s"
      color="text"
      iconType="arrowDown"
      iconSide="right"
      css={styles}
      onClick={onButtonClick}
    >
      {currentTeam?.name || "Select team"}
    </EuiButtonEmpty>
  );

  return (
    <EuiPopover
      button={button}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      anchorPosition="downRight"
      panelPaddingSize="s"
      css={styles.popover}
    >
      <EuiFlexGroup direction="column" gutterSize="s">
        <TeamsTreeView />
        <EuiFlexItem>
          <EuiButton fill size="s" onClick={() => router.push("/dashboards/team/create")}>
            Create a new team
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPopover>
  );
};

const DashboardHeaders = () => {
  const router = useRouter();
  const largeMaxBreakpoint = useIsWithinMaxBreakpoint("l");
  const leftSectionItems = [<CollapsibleNav key={useGeneratedHtmlId()} />];

  return (
    <>
      <EuiHeader
        position="fixed"
        sections={[
          {
            items: [
              <EuiHeaderLogo
                key="elastic-logo"
                iconType="logoElastic"
                style={{ cursor: "pointer" }}
                onClick={() => router.push(`${pathPrefix}/dashboards`)}
              >
                Data dashboard
              </EuiHeaderLogo>,
              largeMaxBreakpoint && leftSectionItems,
            ],
          },
          {
            items: [
              <TeamSwitcher key={useGeneratedHtmlId()} />,
              <ThemeSwitcher key={useGeneratedHtmlId()} />,
              <HeaderUserMenu key={useGeneratedHtmlId()} />,
            ],
          },
        ]}
      />
    </>
  );
};

export default DashboardHeaders;
