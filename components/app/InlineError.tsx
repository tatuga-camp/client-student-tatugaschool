import { LuAlertTriangle, LuRotateCw } from "react-icons/lu";
import { homeLanguage } from "../../data/languages";
import { useGetLanguage } from "../../react-query";

/** A failed fetch inside a pane or sheet: the message and a Retry button. */
export function InlineError({
  onRetry,
  className = "",
}: {
  onRetry: () => void;
  className?: string;
}) {
  const lang = useGetLanguage().data ?? "en";
  return (
    <div
      role="alert"
      className={`flex flex-col items-center gap-2 px-6 py-10 text-center font-Anuphan text-icon-color ${className}`}
    >
      <LuAlertTriangle aria-hidden size={26} className="text-error-color" />
      <p className="text-sm font-bold">{homeLanguage.loadFailed(lang)}</p>
      <button type="button" onClick={onRetry} className="chunky-btn">
        <LuRotateCw aria-hidden />
        {homeLanguage.retry(lang)}
      </button>
    </div>
  );
}
