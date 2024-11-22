import {
  EuiAvatar,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHeaderSectionItemButton,
  EuiPopover,
  EuiText,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { mutate } from "swr";
import useLogout from "../../hooks/useLogout";
import { dashboardHeadersStyles } from "../../layouts/dashboard_headers.style";
import { authContext } from "../../store/auth_store";

const HeaderUserMenu = () => {
  const router = useRouter();
  const styles = dashboardHeadersStyles();
  const { user } = useContext(authContext);
  const headerUserPopoverId = useGeneratedHtmlId({
    prefix: "headerUserPopover",
  });

  const { trigger } = useLogout();

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
                  onClick={() => router.push(`/dashboards/settings/management/profile`)}
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

export default HeaderUserMenu;
