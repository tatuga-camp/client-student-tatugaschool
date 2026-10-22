import React from "react";
import { IoWarningOutline } from "react-icons/io5";
import { CreateIssueReportService } from "../../services/issue";

// Must match ISSUE_REPORT_LIMITS on the server (create-issue-report.dto.ts).
const REPORT_CAPS = {
  errorName: 200,
  message: 2000,
  stack: 20000,
  componentStack: 20000,
  pageUrl: 2000,
  userAgent: 1000,
} as const;

function cap(text: string | null | undefined, max: number): string {
  const value = text ?? "";
  return value.length > max ? value.slice(0, max) : value;
}

type SendState = "idle" | "sending" | "sent" | "failed";

/**
 * Global React Error Boundary.
 *
 * Catches errors thrown during render, in lifecycle methods, in effects and
 * inside state-updater functions anywhere below it, and replaces Next.js'
 * generic "Application error: a client-side exception has occurred" page with
 * a screen that prints everything a developer needs (message, stack,
 * component stack, page URL, time, browser).
 * Users press "Send report" which posts the same details to
 * POST /v1/issues/reports (always anonymous here); the screenshot advice
 * stays as the fallback path when that request fails.
 *
 * Note: like every React error boundary, this does NOT catch errors thrown in
 * event handlers, async callbacks or unhandled promise rejections.
 */

type Props = {
  children: React.ReactNode;
};

type State = {
  error: Error | null;
  componentStack: string | null;
  capturedAt: string | null;
};

const MAX_STACK_LINES = 12;

function trimLines(text: string | null | undefined, max: number): string {
  if (!text) return "(none)";
  const lines = text.trim().split("\n");
  if (lines.length <= max) return lines.join("\n");
  return `${lines.slice(0, max).join("\n")}\n… (${lines.length - max} more lines)`;
}

function describeError(error: unknown): { name: string; message: string } {
  if (error instanceof Error) {
    return { name: error.name || "Error", message: error.message };
  }
  return { name: "Error", message: String(error) };
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, componentStack: null, capturedAt: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error, capturedAt: new Date().toISOString() };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ componentStack: info.componentStack ?? null });
    // Keep the original console output as well so DevTools users still see it.
    console.error("[ErrorBoundary] Uncaught render error:", error);
    if (info.componentStack) {
      console.error("[ErrorBoundary] Component stack:", info.componentStack);
    }
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }
    return (
      <ErrorFallback
        error={this.state.error}
        componentStack={this.state.componentStack}
        capturedAt={this.state.capturedAt ?? new Date().toISOString()}
      />
    );
  }
}

type FallbackProps = {
  error: Error;
  componentStack: string | null;
  capturedAt: string;
};

function ErrorFallback({ error, componentStack, capturedAt }: FallbackProps) {
  const [copied, setCopied] = React.useState(false);
  const [sendState, setSendState] = React.useState<SendState>("idle");
  const [reference, setReference] = React.useState<string | null>(null);
  // Collapsed so the send button stays in reach on a phone; opened when
  // sending fails, because then a screenshot has to carry the details.
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const sentForRef = React.useRef<string | null>(null);
  const { name, message } = describeError(error);
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const browser = typeof navigator !== "undefined" ? navigator.userAgent : "";

  const report = [
    `Error: ${name}: ${message}`,
    `Time: ${capturedAt}`,
    `Page: ${pageUrl}`,
    `Browser: ${browser}`,
    "",
    "Stack:",
    trimLines(error.stack, MAX_STACK_LINES),
    "",
    "Component stack:",
    trimLines(componentStack, MAX_STACK_LINES),
  ].join("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable (http, old browsers, permissions).
      // The text is still visible on screen for a screenshot.
    }
  };

  const handleSend = async () => {
    if (sendState === "sending" || sentForRef.current === capturedAt) return;
    setSendState("sending");
    try {
      const result = await CreateIssueReportService({
        errorName: cap(name, REPORT_CAPS.errorName),
        message: cap(message, REPORT_CAPS.message),
        stack: cap(error.stack, REPORT_CAPS.stack),
        componentStack: cap(componentStack, REPORT_CAPS.componentStack),
        pageUrl: cap(pageUrl, REPORT_CAPS.pageUrl),
        userAgent: cap(browser, REPORT_CAPS.userAgent),
        capturedAt,
      });
      sentForRef.current = capturedAt;
      setReference(result.reportId.slice(-6).toUpperCase());
      setSendState("sent");
    } catch {
      setSendState("failed");
      setDetailsOpen(true);
    }
  };

  // Kept short: these sit on one line of a ~320px wide phone button.
  const sendLabel: Record<SendState, string> = {
    idle: "ส่งรายงาน / Send report",
    sending: "กำลังส่ง… / Sending…",
    sent: `ส่งแล้ว / Sent · ref ${reference ?? ""}`,
    failed: "ส่งอีกครั้ง / Try again",
  };

  // Mobile first: most students land here from a phone, so the explanation
  // stays short, the details stay folded, and the actions sit in a bar pinned
  // to the bottom of the screen within thumb reach.
  return (
    <div className="flex min-h-dvh w-full flex-col bg-background-color font-Anuphan text-gray-800">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-4 pt-10">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-color/10 text-3xl text-error-color">
            <IoWarningOutline aria-hidden />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">
            เกิดข้อผิดพลาดในหน้านี้
          </h1>
          <p className="text-sm text-gray-500">Something went wrong</p>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            กด <span className="font-semibold">ส่งรายงาน</span>{" "}
            ด้านล่างเพื่อแจ้งทีมพัฒนา
          </p>
          <p className="text-sm leading-relaxed text-gray-500">
            Tap Send report below so we can fix it.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400">
            ข้อความผิดพลาด / Error
          </p>
          <p className="mt-1 break-words text-sm font-semibold text-error-color">
            {name}: {message}
          </p>
          <dl className="mt-3 space-y-1 text-xs text-gray-500">
            <div>
              <dt className="inline font-semibold">เวลา / Time: </dt>
              <dd className="inline break-all">{capturedAt}</dd>
            </div>
            <div>
              <dt className="inline font-semibold">หน้า / Page: </dt>
              <dd className="inline break-all">{pageUrl}</dd>
            </div>
            <div>
              <dt className="inline font-semibold">Browser: </dt>
              <dd className="inline break-all">{browser}</dd>
            </div>
          </dl>
        </div>

        <details
          open={detailsOpen}
          onToggle={(e) => setDetailsOpen(e.currentTarget.open)}
          className="mt-3 rounded-2xl border border-gray-100 bg-white px-4 py-2 shadow-sm"
        >
          <summary className="cursor-pointer py-2 text-sm font-semibold text-gray-600">
            รายละเอียดทางเทคนิค / Technical details
          </summary>
          <div className="mt-1 text-xs font-semibold text-gray-500">Stack</div>
          <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-background-color p-3 font-mono text-[11px] leading-relaxed text-gray-700">
            {trimLines(error.stack, MAX_STACK_LINES)}
          </pre>
          <div className="mt-3 text-xs font-semibold text-gray-500">
            Component stack
          </div>
          <pre className="mb-2 mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-background-color p-3 font-mono text-[11px] leading-relaxed text-gray-700">
            {trimLines(componentStack, MAX_STACK_LINES)}
          </pre>
        </details>

        {sendState === "failed" && (
          <p
            role="alert"
            className="mt-3 rounded-2xl bg-error-color/10 p-3 text-sm leading-relaxed text-error-color"
          >
            ส่งรายงานไม่สำเร็จ กรุณาแคปหน้าจอนี้ส่งให้คุณครูหรือทีมพัฒนา / The
            report could not be sent. Please screenshot this screen and send it
            to your teacher or the developer.
          </p>
        )}
      </main>

      <div className="sticky bottom-0 border-t border-gray-100 bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md flex-col gap-2">
          <button
            type="button"
            onClick={handleSend}
            disabled={sendState === "sending" || sendState === "sent"}
            data-send-state={sendState}
            className={`flex min-h-12 w-full items-center justify-center rounded-2xl px-4 text-base font-semibold ${
              sendState === "sent"
                ? "border border-success-color bg-success-color/10 text-success-color"
                : "main-button"
            } disabled:cursor-default disabled:opacity-90`}
          >
            {/* One text node inside an element: browser translation swaps bare
                text nodes for <font> tags, and inserting "✓ " beside one made
                React throw NotFoundError on this very screen. */}
            <span>
              {`${sendState === "sent" ? "✓ " : ""}${sendLabel[sendState]}`}
            </span>
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="second-button flex min-h-12 w-full items-center justify-center border border-gray-200 text-base font-semibold"
          >
            โหลดหน้าใหม่ / Reload page
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-11 rounded-2xl px-2 text-sm font-medium text-primary-color active:bg-primary-color/10"
            >
              <span>
                {copied ? "คัดลอกแล้ว / Copied" : "คัดลอก / Copy"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              className="min-h-11 rounded-2xl px-2 text-sm font-medium text-primary-color active:bg-primary-color/10"
            >
              หน้าหลัก / Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
