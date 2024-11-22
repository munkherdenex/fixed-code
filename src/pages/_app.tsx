import "@elastic/charts/dist/theme_only_dark.css";
import "@elastic/charts/dist/theme_only_light.css";
import { EuiErrorBoundary } from "@elastic/eui";
import { Global } from "@emotion/react";
import "core-js/stable";
import { AppProps } from "next/app";
import dynamic from "next/dynamic";
import Head from "next/head";
import { FunctionComponent } from "react";
import "react-querybuilder/dist/query-builder.css";
import "react-quill/dist/quill.snow.css";
import "regenerator-runtime/runtime";
import { Theme } from "../components/theme";
import GlobalToastList from "../components/toast";
import "../custom_typings/index.d.ts";
import SWRConfigLayout from "../layouts/swr_config";
import { AuthProvider } from "../store/auth_store";
import { ProductProvider } from "../store/products_store";
import { TeamsProvider } from "../store/teams_store";
import { globalStyes } from "../styles/global.styles";
import { NextIntlClientProvider } from "next-intl";
import { useRouter } from "next/router";

const Chrome = dynamic(() => import("../components/chrome"), { ssr: false });

declare global {
  interface Window {
    env: {
      BACKEND_URL: string;
      IS_POCKET: string;
      IS_REGISTER_ENABLED: string;
      CRM: string;
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
const EuiApp: FunctionComponent<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter();
  return (
    <>
      <Head>
        {/* You can override this in other pages - see index.tsx for an example */}
        <title>DATA</title>
      </Head>
      <Global styles={globalStyes} />
      <Theme>
        <Chrome>
          <EuiErrorBoundary>
            <SWRConfigLayout>
              <ProductProvider>
                <AuthProvider>
                  <TeamsProvider>
                    <NextIntlClientProvider
                      locale={router.locale}
                      timeZone="Mongolia/Ulaanbaatar"
                      messages={pageProps.messages}
                    >
                      <Component {...pageProps} />
                    </NextIntlClientProvider>
                    <GlobalToastList />
                  </TeamsProvider>
                </AuthProvider>
              </ProductProvider>
            </SWRConfigLayout>
          </EuiErrorBoundary>
        </Chrome>
      </Theme>
    </>
  );
};

export default EuiApp;
