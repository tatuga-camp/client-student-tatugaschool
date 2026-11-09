import { Html, Head, Main, NextScript } from "next/document";
import { UnsupportedBrowserNotice } from "../components/app/UnsupportedBrowserNotice";
import { NOTICE_CSS, NOTICE_SCRIPT_SRC } from "../utils/unsupportedBrowser";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* <script src="https://unpkg.com/react-scan/dist/auto.global.js"></script> */}
        <style>{NOTICE_CSS}</style>
      </Head>
      <body className="antialiased">
        {/* A browser too old for the app (below iOS 15.4 / Chrome 108) gets
            this notice instead of an unstyled page (utils/unsupportedBrowser).
            The script must run synchronously, right after the notice and
            before the app paints. */}
        <UnsupportedBrowserNotice />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src={NOTICE_SCRIPT_SRC} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
