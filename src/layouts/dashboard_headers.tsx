import { useState } from "react";
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
  EuiButton,
  EuiButtonEmpty,
} from "@elastic/eui";
import ThemeSwitcher from "../components/chrome/theme_switcher";
import CollapsibleNav from "../components/dashboards/collapsible_nav";
import { dashboardHeadersStyles } from "./dashboard_headers.style";
import { useRouter } from "next/router";

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
      Team 1
    </EuiButtonEmpty>
  );

  return (
    <EuiPopover
      button={button}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      anchorPosition="downRight"
    >
      hello
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
