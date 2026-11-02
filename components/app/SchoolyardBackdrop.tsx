import React from "react";
import { SchoolyardScene } from "./scene/SchoolyardScene";

/**
 * The backdrop is decoration: a render error in it shows nothing there and
 * never takes the page's card down with it.
 */
class BackdropBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error("[SchoolyardBackdrop] Render error:", error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * The full-window schoolyard (its wide version, following the time of day)
 * behind the sign-in and other phone-sized pages on a computer. PhoneFrame
 * mounts it only on `desk` and outside the subject shell.
 */
export function SchoolyardBackdrop() {
  return (
    <BackdropBoundary>
      <SchoolyardScene
        variant="desktop"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </BackdropBoundary>
  );
}
