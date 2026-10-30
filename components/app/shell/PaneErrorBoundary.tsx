import React from "react";
import { LuAlertTriangle, LuChevronLeft, LuRotateCw } from "react-icons/lu";
import { homeLanguage } from "../../../data/languages";
import { useGetLanguage } from "../../../react-query";

type Props = {
  children: React.ReactNode;
  /** Detail pages lose their own back button with the crash: offer one. */
  onBack?: () => void;
};

type State = { error: Error | null; attempt: number };

/**
 * Keeps a render crash inside one tab pane or detail page, so the tab bar
 * and the other panes stay usable. Retry mounts the pane again.
 */
export default class PaneErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, attempt: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[PaneErrorBoundary] Render error:", error);
    if (info.componentStack) {
      console.error("[PaneErrorBoundary] Component stack:", info.componentStack);
    }
  }

  private retry = () => {
    this.setState((s) => ({ error: null, attempt: s.attempt + 1 }));
  };

  render() {
    if (this.state.error) {
      return <PaneError onRetry={this.retry} onBack={this.props.onBack} />;
    }
    // A new key on retry remounts the pane with fresh state.
    return (
      <React.Fragment key={this.state.attempt}>
        {this.props.children}
      </React.Fragment>
    );
  }
}

function PaneError({
  onRetry,
  onBack,
}: {
  onRetry: () => void;
  onBack?: () => void;
}) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  return (
    <div
      role="alert"
      className="flex h-full w-full flex-col items-center justify-center gap-3 bg-background-color px-6 text-center font-Anuphan text-icon-color"
      style={{ paddingTop: "var(--safe-top)" }}
    >
      <LuAlertTriangle aria-hidden size={32} className="text-error-color" />
      <p className="text-base font-bold">{homeLanguage.paneError(lang)}</p>
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
    </div>
  );
}
