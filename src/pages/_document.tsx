import { ReactElement } from "react";
import Document, { Head, Html, Main, NextScript } from "next/document";
import { defaultTheme, Theme, themeConfig } from "../lib/theme";
import Script from "next/script";

const pathPrefix = process.env.PATH_PREFIX;

function themeLink(theme: Theme): ReactElement {
  let disabledProps = {};

  if (theme.id !== defaultTheme) {
    disabledProps = {
      disabled: true,
      "aria-disabled": true,
    };
  }

  return (
    <link
      rel="stylesheet"
      href={`${pathPrefix}/${theme.publicPath}`}
      data-name="eui-theme"
      data-theme-name={theme.name}
      data-theme={theme.id}
      key={theme.id}
      {...disabledProps}
    />
  );
}

/**
 * A custom `Document` is commonly used to augment your application's
 * `<html>` and `<body>` tags. This is necessary because Next.js pages skip
 * the definition of the surrounding document's markup.
 *
 * In this case, we customize the default `Document` implementation to
 * inject the available EUI theme files.  Only the `light` theme is
 * initially enabled.
 *
 * @see https://nextjs.org/docs/advanced-features/custom-document
 */
export default class MyDocument extends Document {
  render(): ReactElement {
    const isLocalDev = process.env.NODE_ENV === "development";

    const favicon25 = `${pathPrefix}/images/favicon.png`;

    return (
      <Html lang="en">
        <Head>
          <meta
            name="description"
            content="CRM+CDP байгууллагын харилцагчдын бүртгэл хөтлөх, сегментэд хувааж мэдэгдэл илгээх зэрэг үйлдэлтэй систем юм. Мөн дуудалгын төв, чатаар ирсэн болон салбарт ирсэн гомдол зэргийг бүртгэж удирдах боломжтой."
          />
          <meta property="og:title" content="CDP+CRM" />
          <meta
            property="og:description"
            content="CRM+CDP байгууллагын харилцагчдын бүртгэл хөтлөх, сегментэд хувааж мэдэгдэл илгээх зэрэг үйлдэлтэй систем юм. Мөн дуудалгын төв, чатаар ирсэн болон салбарт ирсэн гомдол зэргийг бүртгэж удирдах боломжтой."
          />
          <meta property="og:url" content="https://crm.pocket.mn" />
          <meta name="eui-styles" />

          {themeConfig.availableThemes.map((each) => themeLink(each))}

          <meta name="eui-styles-utility" />

          <link
            rel="icon"
            type="image/png"
            href={favicon25}
            sizes="25x25"
          />
          <Script strategy="beforeInteractive" src="/config/env.js"></Script>
        </Head>
        <body className="guideBody">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
