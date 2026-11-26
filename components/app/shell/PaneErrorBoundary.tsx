import React from "react";
import { LuAlertTriangle, LuChevronLeft, LuRotateCw } from "react-icons/lu";
import { homeLanguage } from "../../../data/languages";
import { useGetLanguage } from "../../../react-query";
import { describeError, sendCrashReport } from "../../common/ErrorBoundary";

type Props = {
  children: React.ReactNode;
  /** Detail pages lose their own back button with the crash: offer one. */
  onBack?: () => void;
};

type State = {
  error: Error | null;
  componentStack: string | null;
  capturedAt: string | null;
  attempt: number;
};

/**
 * Keeps a render crash inside one tab pane or detail page, so the tab bar
 * and the other panes stay usable. Retry mounts the pane again. The error
 * message is shown and can be sent to the team (as on the full-page crash
 * screen), so a report from a school says why it broke.
 */
export default class PaneErrorBoundary extends React.Component<Props, State> {
  state: State = {
    error: null,
    componentStack: null,
    capturedAt: null,
    attempt: 0,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error, capturedAt: new Date().toISOString() };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ componentStack: info.componentStack ?? null });
    console.error("[PaneErrorBoundary] Render error:", error);
    if (info.componentStack) {
      console.error("[PaneErrorBoundary] Component stack:", info.componentStack);
    }
  }

  private retry = () => {
    this.setState((s) => ({
      error: null,
      componentStack: null,
      capturedAt: null,
      attempt: s.attempt + 1,
    }));
  };

  render() {
    if (this.state.error) {
      return (
        <PaneError
          error={this.state.error}
          componentStack={this.state.componentStack}
          capturedAt={this.state.capturedAt ?? new Date().toISOString()}
          onRetry={this.retry}
          onBack={this.props.onBack}
        />
      );
    }
    // A new key on retry remounts the pane with fresh state.
    return (
      <React.Fragment key={this.state.attempt}>
        {this.props.children}
      </React.Fragment>
    );
  }
}

type SendState = "idle" | "sending" | "sent" | "failed";

function PaneError({
  error,
  componentStack,
  capturedAt,
  onRetry,
  onBack,
}: {
  error: Error;
  componentStack: string | null;
  capturedAt: string;
  onRetry: () => void;
  onBack?: () => void;
}) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const [sendState, setSendState] = React.useState<SendState>("idle");
  const [reference, setReference] = React.useState("");
  const { name, message } = describeError(error);

  const send = async () => {
    if (sendState === "sending" || sendState === "sent") return;
    setSendState("sending");
    try {
      setReference(await sendCrashReport(error, componentStack, capturedAt));
      setSendState("sent");
    } catch {
      setSendState("failed");
    }
  };

  const sendLabel =
    sendState === "sent"
      ? homeLanguage.paneSent(lang, reference)
      : sendState === "sending"
        ? homeLanguage.paneSending(lang)
        : homeLanguage.paneSendReport(lang);
  return (
    <div
      role="alert"
      className="flex h-full w-full flex-col items-center justify-center gap-3 bg-background-color px-6 text-center font-Anuphan text-icon-color"
      style={{ paddingTop: "var(--safe-top)" }}
    >
      <LuAlertTriangle aria-hidden size={32} className="text-error-color" />
      <p className="text-base font-bold">{homeLanguage.paneError(lang)}</p>
      <p className="max-w-md select-text break-words font-mono text-xs text-gray-500">
        {name}: {message}
      </p>
      <div className="mt-1 flex gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="chunky-btn chunky-btn-secondary"
          >
            <LuChevronLeft aria-hidden />
            {homeLanguage.back(lang)}
          </button>
        )}
        <button type="button" onClick={onRetry} className="chunky-btn">
          <LuRotateCw aria-hidden />
          {homeLanguage.retry(lang)}
        </button>
      </div>
      <button
        type="button"
        onClick={send}
        disabled={sendState === "sending" || sendState === "sent"}
        className="min-h-11 rounded-2xl px-3 text-sm font-semibold text-primary-color underline-offset-2 hover:underline disabled:cursor-default disabled:no-underline"
      >
        {/* One text node in an element: see the note in ErrorBoundary. */}
        <span>{sendLabel}</span>
      </button>
      {sendState === "failed" && (
        <p className="max-w-xs text-xs text-error-color">
          {homeLanguage.paneSendFailed(lang)}
        </p>
      )}
    </div>
  );
}
