import React from "react";

/**
 * Threshold color classes shared by the ring and any completion bar/label:
 * 100% → success, 50–99% → warning, <50% → error. Returns both the `text-*`
 * variant (for the ring stroke via currentColor) and the `bg-*` variant (for a
 * progress-bar fill). Class strings are literal so Tailwind can detect them.
 */
export function submissionColorClasses(percentage: number): {
  text: string;
  bg: string;
} {
  const clamped = Math.max(0, Math.min(100, percentage));
  if (clamped === 100) {
    return { text: "text-success-color", bg: "bg-success-color" };
  }
  if (clamped >= 50) {
    return { text: "text-warning-color", bg: "bg-warning-color" };
  }
  return { text: "text-error-color", bg: "bg-error-color" };
}

type Props = {
  /** null → render the avatar with no ring. */
  percentage: number | null;
  /** Hover/aria text, e.g. "7/10 submitted (70%)". */
  label?: string;
  /** Outer size in px. Default 28 (matches the h-7 w-7 trigger avatar). */
  size?: number;
  strokeWidth?: number;
  /** The avatar element, typically a next/image <Image fill />. */
  children: React.ReactNode;
};

function AvatarSubmissionRing({
  percentage,
  label,
  size = 28,
  strokeWidth = 3,
  children,
}: Props) {
  const showRing = percentage !== null;
  const clamped = Math.max(0, Math.min(100, percentage ?? 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const center = size / 2;
  const colorClass = submissionColorClasses(clamped).text;

  // Inset the avatar so it sits inside the ring; fill the box when no ring.
  const inset = showRing ? strokeWidth + 1 : 0;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      title={showRing ? label : undefined}
      aria-label={showRing ? label : undefined}
      role={showRing ? "img" : undefined}
    >
      {showRing && (
        <svg
          width={size}
          height={size}
          className="absolute inset-0 -rotate-90"
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={colorClass}
          />
        </svg>
      )}
      <div
        className="absolute overflow-hidden rounded-full"
        style={{ top: inset, left: inset, right: inset, bottom: inset }}
      >
        {children}
      </div>
    </div>
  );
}

export default AvatarSubmissionRing;
