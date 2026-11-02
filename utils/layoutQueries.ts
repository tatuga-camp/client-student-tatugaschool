// The desktop layout's breakpoints. Tailwind's `desk:` / `wide:` screens
// (tailwind.config.ts) and the JS hooks (components/app/useLayoutMode.ts) both
// read these, so CSS and JS always agree. The height guard keeps landscape
// phones on the phone layout.

/** Tablets and computers: sidebar shell, no phone frame. */
export const DESK_QUERY = "(min-width: 768px) and (min-height: 500px)";

/** Laptops and desktops: full sidebar, two-column assignment page. */
export const WIDE_QUERY = "(min-width: 1024px) and (min-height: 500px)";
