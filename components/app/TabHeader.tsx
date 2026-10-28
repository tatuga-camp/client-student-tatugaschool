import React from "react";
import { useTimeOfDay } from "../../hook/useTimeOfDay";
import { lighten, SCENE_PALETTES } from "../../utils/timeOfDay";

type Props = {
  title: string;
  /** Bottom-right slot, e.g. the subject chip. */
  right?: React.ReactNode;
  /** Me's taller band (room for the photo). */
  tall?: boolean;
};

/**
 * Pane body under a TabHeader: overlaps the band by 16px with rounded top
 * corners, and is the pane's own vertical scroller (`.app-scroll`).
 * Use inside a `flex h-full flex-col` pane, right after the header.
 */
export const TAB_BODY_CLASS =
  "app-scroll relative z-[1] -mt-4 min-h-0 flex-1 rounded-t-[20px] bg-background-color";

// Cloud shapes from the tabs-screens mockup, in its band coordinates.
const CLOUDS = {
  normal: {
    viewBox: "0 0 280 112",
    shapes: (
      <>
        <ellipse cx="210" cy="50" rx="30" ry="10" />
        <circle cx="200" cy="44" r="12" />
        <circle cx="218" cy="40" r="14" />
        <ellipse cx="60" cy="34" rx="20" ry="7" />
        <circle cx="54" cy="30" r="8" />
      </>
    ),
  },
  tall: {
    viewBox: "0 0 280 176",
    shapes: (
      <>
        <ellipse cx="220" cy="80" rx="30" ry="10" />
        <circle cx="210" cy="74" r="12" />
        <circle cx="228" cy="70" r="14" />
        <ellipse cx="50" cy="60" rx="20" ry="7" />
        <circle cx="44" cy="56" r="8" />
      </>
    ),
  },
};

/**
 * The sky band on top of a tab: the current time of day's sky (noon until
 * it is known), two clouds, the title bottom-left and `right` centred on
 * the title line. 112px tall (176px when `tall`), and taller under a notch
 * deeper than the 47px reference status bar, so nothing sits beneath it.
 * The title is dark on the light morning sky (the palette's statusText),
 * white otherwise.
 */
export function TabHeader({ title, right, tall = false }: Props) {
  const timeOfDay = useTimeOfDay();
  const palette = timeOfDay?.palette ?? SCENE_PALETTES.noon;
  const sky = palette.skyTop;
  const clouds = tall ? CLOUDS.tall : CLOUDS.normal;
  const height = tall
    ? "max(176px, calc(var(--safe-top) + 129px))"
    : "max(112px, calc(var(--safe-top) + 65px))";
  return (
    <header
      className="relative shrink-0 overflow-hidden font-Anuphan"
      style={{
        height,
        background: `linear-gradient(180deg, ${sky}, ${lighten(sky, 0.25)})`,
      }}
    >
      <svg
        aria-hidden
        viewBox={clouds.viewBox}
        className="pointer-events-none absolute inset-x-0 bottom-0 w-full"
        style={{ height: tall ? 176 : 112 }}
        fill="rgba(255,255,255,.28)"
      >
        {clouds.shapes}
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 pb-7 pl-4 pr-3.5">
        <h1
          className="min-w-0 truncate text-[22px] font-bold leading-tight"
          style={{
            color: palette.statusText === "dark" ? "#383767" : "#FFFFFF",
          }}
        >
          {title}
        </h1>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </header>
  );
}
