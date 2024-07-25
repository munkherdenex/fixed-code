import Image from "next/image";
import Link from "next/link";
import { EuiHeader, EuiTitle, useEuiTheme, EuiButton } from "@elastic/eui";
import { imageLoader } from "../../lib/loader";
import ThemeSwitcher from "./theme_switcher";
import { headerStyles } from "./header.styles";
import Logo from "../../../public/images/logo-eui.svg";

const Header = () => {
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
                <Image width={24} height={24} src={Logo} alt="" loader={imageLoader} />
                <EuiTitle size="xxs" css={styles.title}>
                  <span>Data UI</span>
                </EuiTitle>
              </a>
            </Link>,
          ],
        },
        {
          items: [
            <Link key="signin" href="/signin" passHref>
              <EuiButton style={{ minWidth: 80, margin: 10 }} color="success" size="s">
                Sign In
              </EuiButton>
            </Link>,

            <Link key="signup" href="/signup" passHref>
              <EuiButton style={{ minWidth: 80 }} size="s">
                Sign Up
              </EuiButton>
            </Link>,
            <ThemeSwitcher key="theme-switcher" />,
          ],
        },
      ]}
    />
  );
};

export default Header;
