import Image from "next/image";
import Link from "next/link";
import { EuiHeader, EuiTitle, useEuiTheme, EuiButton } from "@elastic/eui";
import { imageLoader } from "../../lib/loader";
import ThemeSwitcher from "./theme_switcher";
import { headerStyles } from "./header.styles";
import { useContext } from "react";
import { authContext } from "../../store/auth_store";
import { IS_REGISTER_ENABLED } from "../../constants";

const Header = () => {
  const { user } = useContext(authContext);
  const { euiTheme } = useEuiTheme();
  const styles = headerStyles(euiTheme);

  return (
    <EuiHeader
      position="fixed"
      sections={[
        {
          items: [
            <Link key="logo-eui" href="/" passHref>
              <a css={styles.logo}>
                <Image
                  width={24}
                  height={24}
                  src="/images/logo-eui.svg"
                  alt=""
                  loader={imageLoader}
                />
                <EuiTitle size="xxs" css={styles.title}>
                  <span>CRM</span>
                </EuiTitle>
              </a>
            </Link>,
          ],
        },
        {
          items: user
            ? [
                <Link key="dashboards" href="/dashboards" passHref>
                  <EuiButton style={{ minWidth: 80, margin: 10 }} color="primary" fill size="s">
                    Dashboard
                  </EuiButton>
                </Link>,
                <ThemeSwitcher key="theme-switcher" />,
              ]
            : [
                IS_REGISTER_ENABLED && (
                  <Link key="signin" href="/signin" passHref>
                    <EuiButton style={{ minWidth: 80, margin: 10 }} color="success" size="s">
                      Sign In
                    </EuiButton>
                  </Link>
                ),
                IS_REGISTER_ENABLED && (
                  <Link key="signup" href="/signup" passHref>
                    <EuiButton style={{ minWidth: 80 }} size="s">
                      Sign Up
                    </EuiButton>
                  </Link>
                ),
                <ThemeSwitcher key="theme-switcher" />,
              ],
        },
      ]}
    />
  );
};

export default Header;
