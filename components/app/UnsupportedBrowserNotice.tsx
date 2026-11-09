import type { CSSProperties } from "react";
import { NOTICE_ID } from "../../utils/unsupportedBrowser";

// Shown by public/unsupported-browser.js on a browser too old for the app
// (utils/unsupportedBrowser.ts). Inline styles only: on those browsers the
// app's stylesheet doesn't apply. Colours are the theme's (tailwind.config.ts).

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans Thai', Tahoma, sans-serif";

const s = {
  // top/right/bottom/left, not inset: `inset` is iOS 14.5+.
  overlay: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 2147483647,
    overflow: "auto",
    WebkitOverflowScrolling: "touch",
    background: "#F7F8FA",
    fontFamily: FONT,
    lineHeight: 1.5,
  },
  column: { maxWidth: 440, margin: "0 auto", padding: "40px 20px" },
  card: {
    background: "#fff",
    border: "2px solid #E3E8F0",
    borderBottomWidth: 4,
    borderRadius: 16,
    padding: "24px 20px",
  },
  brand: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.04em",
    color: "#2C7CD1",
  },
  title: { margin: "8px 0 4px", fontSize: 22, color: "#383767" },
  lead: { margin: "0 0 16px", fontSize: 15, color: "#5A6080" },
  device: {
    display: "none",
    margin: "0 0 16px",
    padding: "8px 12px",
    borderRadius: 10,
    background: "#FFF6D6",
    color: "#7A5B00",
    fontSize: 14,
    fontWeight: 700,
  },
  list: { margin: 0, padding: "0 0 0 20px" },
  item: { margin: "0 0 12px" },
  th: { fontWeight: 700, color: "#383767" },
  en: { color: "#5A6080", fontSize: 14 },
  link: {
    marginTop: 4,
    padding: "10px 12px",
    borderRadius: 10,
    background: "#F7F8FA",
    border: "1px solid #E3E8F0",
    color: "#2C7CD1",
    fontSize: 14,
    wordBreak: "break-all",
    WebkitUserSelect: "all",
    userSelect: "all",
  },
} satisfies Record<string, CSSProperties>;

function Step({
  th,
  en,
  ...rest
}: { th: string; en: string } & Record<`data-${string}`, boolean>) {
  return (
    <li style={s.item} {...rest}>
      <div style={s.th}>{th}</div>
      <div style={s.en}>{en}</div>
    </li>
  );
}

export function UnsupportedBrowserNotice() {
  return (
    <div id={NOTICE_ID} hidden role="alert">
      <div style={s.overlay}>
        <div style={s.column}>
          <div style={s.card}>
            <div style={s.brand}>TATUGA SCHOOL</div>
            <h1 style={s.title}>เบราว์เซอร์นี้เก่าเกินไป</h1>
            <p style={s.lead}>
              This browser is too old to open Tatuga School.
            </p>
            {/* The script writes the detected iOS version here. */}
            <p data-ub-device style={s.device} />
            <ol style={s.list}>
              <Step
                data-ub-ios
                th="อัปเดต iPhone / iPad เป็น iOS 15.4 ขึ้นไป"
                en="Update to iOS 15.4 or later: การตั้งค่า (Settings) › ทั่วไป (General) › รายการอัปเดตซอฟต์แวร์ (Software Update)"
              />
              <Step
                th="หรืออัปเดตเบราว์เซอร์ (เช่น Chrome) เป็นเวอร์ชันล่าสุด"
                en="Or update your browser (such as Chrome) to the latest version."
              />
              <Step
                th="หรือเปิดลิงก์นี้ด้วยอุปกรณ์เครื่องอื่น"
                en="Or open this link on another phone, tablet or computer:"
              />
            </ol>
            {/* The script writes the page's address here. */}
            <div data-ub-link style={s.link} />
          </div>
        </div>
      </div>
    </div>
  );
}
