import "@elastic/charts/dist/theme_only_dark.css";
import "@elastic/charts/dist/theme_only_light.css";
import { EuiErrorBoundary } from "@elastic/eui";
import { Global } from "@emotion/react";
import "core-js/stable";
import { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";
import { FunctionComponent } from "react";
import "react-querybuilder/dist/query-builder.css";
import "react-quill/dist/quill.snow.css";
import "regenerator-runtime/runtime";
import Chrome from "../components/chrome";
import { Theme } from "../components/theme";
import GlobalToastList from "../components/toast";
import "../custom_typings/index.d.ts";
import SWRConfigLayout from "../layouts/swr_config";
import { AuthProvider } from "../store/auth_store";
import { TeamsProvider } from "../store/teams_store";
import { globalStyes } from "../styles/global.styles";

declare global {
  interface Window {
    env: {
      BACKEND_URL: string;
      IS_POCKET: string;
    };
  }
  interface Error {
    status?: number;
    error_message?: any;
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
          <SWRConfigLayout>
            <AuthProvider>
              <TeamsProvider>
                <Component {...pageProps} />
                <GlobalToastList />
              </TeamsProvider>
            </AuthProvider>
          </SWRConfigLayout>
        </EuiErrorBoundary>
      </Chrome>
    </Theme>
  </>
);

export default EuiApp;
