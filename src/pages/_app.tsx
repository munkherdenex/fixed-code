import "../custom_typings/index.d.ts";
import "core-js/stable";
import "regenerator-runtime/runtime";
import { FunctionComponent } from "react";
import { AppProps } from "next/app";
import Head from "next/head";
import { EuiErrorBoundary } from "@elastic/eui";
import { Global } from "@emotion/react";
import Chrome from "../components/chrome";
import { Theme } from "../components/theme";
import { globalStyes } from "../styles/global.styles";
import "react-querybuilder/dist/query-builder.css";
import Script from "next/script";
import { AuthProvider } from "../store/auth_store";
import GlobalToastList from "../components/toast";

declare global {
  interface Window {
    env: {
      BACKEND_URL: string;
    };
  }
}

/**
 * Next.js uses the App component to initialize pages. You can override it
 * and control the page initialization. Here use use it to render the
 * `Chrome` component on each page, and apply an error boundary.
 *
 * @see https://nextjs.org/docs/advanced-features/custom-app
 */
const EuiApp: FunctionComponent<AppProps> = ({ Component, pageProps }) => (
  <>
    <Head>
      {/* You can override this in other pages - see index.tsx for an example */}
      <title>DATA</title>
    </Head>
    <Script strategy="beforeInteractive" src="/config/env.js"></Script>
    <Global styles={globalStyes} />
    <Theme>
      <Chrome>
        <EuiErrorBoundary>
          <AuthProvider>
            <Component {...pageProps} />
            <GlobalToastList />
          </AuthProvider>
        </EuiErrorBoundary>
      </Chrome>
    </Theme>
  </>
);

export default EuiApp;
