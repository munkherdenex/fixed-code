import { useContext, useState } from "react";
import {
  EuiHeaderSectionItemButton,
  EuiHeaderLogo,
  EuiHeader,
  EuiFlexItem,
  useGeneratedHtmlId,
  EuiAvatar,
  EuiText,
  EuiSpacer,
  EuiFlexGroup,
  EuiPopover,
  EuiLink,
  EuiButtonEmpty,
  EuiButton,
} from "@elastic/eui";
import ThemeSwitcher from "../components/chrome/theme_switcher";
import CollapsibleNav from "../components/dashboards/collapsible_nav";
import { dashboardHeadersStyles } from "./dashboard_headers.style";
import { useRouter } from "next/router";
import { teamsContext } from "../store/teams_store";

const pathPrefix = process.env.PATH_PREFIX;

const HeaderUserMenu = () => {
  const router = useRouter();
  const headerUserPopoverId = useGeneratedHtmlId({
    prefix: "headerUserPopover",
  });

  const [isOpen, setIsOpen] = useState(false);

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
      <EuiAvatar name="John Username" size="s" />
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
            <EuiAvatar name="John Username" size="xl" />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText>
              <p>John Username</p>
            </EuiText>
            <EuiSpacer size="m" />
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiFlexGroup justifyContent="spaceBetween">
                  <EuiFlexItem grow={false}>
                    <EuiLink href={`${pathPrefix}/dashboards/management/settings`}>
                      Edit profile
                    </EuiLink>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiLink
                      onClick={() => {
                        router.push(`${pathPrefix}/`);
                      }}
                    >
                      Log out
                    </EuiLink>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    </EuiPopover>
  );
};

const TeamSwitcher = () => {
  const styles = dashboardHeadersStyles();
  const { teams, currentTeam, changeCurrentTeam } = useContext(teamsContext);
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

  const renderTeams = () => {
    return teams?.map((team) => {
      return (
        <EuiFlexItem key={team.id}>
          <EuiButton
            size="s"
            color={currentTeam?.id === team?.id ? "primary" : "text"}
            key={team.id}
            onClick={() => changeCurrentTeam(team.id)}
          >
            {team.name}
          </EuiButton>
        </EuiFlexItem>
      );
    });
  };

  return (
    <EuiPopover
      button={button}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      anchorPosition="downRight"
      panelPaddingSize="s"
    >
      <EuiFlexGroup direction="column" gutterSize="s">
        {renderTeams()}
        <EuiFlexItem>
          <EuiButton fill size="s" href="/dashboards/team/create">
            Create a new team
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPopover>
  );
};

const DashboardHeaders = () => {
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
                href={`${pathPrefix}/dashboards`}
              >
                Data dashboard
              </EuiHeaderLogo>,
              leftSectionItems,
            ],
            borders: "none",
          },
          {
            items: [
              <TeamSwitcher key={useGeneratedHtmlId()} />,
              <ThemeSwitcher key={useGeneratedHtmlId()} />,
              <HeaderUserMenu key={useGeneratedHtmlId()} />,
            ],
            borders: "none",
          },
        ]}
      />
    </>
  );
};

export default DashboardHeaders;
