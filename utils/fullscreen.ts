// Fullscreen API with Safari's webkit-prefixed fallback. iPhone Safari has no
// element fullscreen at all, so every call is a safe no-op when unsupported,
// and exit only runs while something is actually fullscreen (calling it
// otherwise rejects with "Document not active").
type WebkitDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => void;
};
type WebkitElement = HTMLElement & {
  webkitRequestFullscreen?: () => void;
};

export const getFullscreenElement = () =>
  document.fullscreenElement ??
  (document as WebkitDocument).webkitFullscreenElement ??
  null;

export const enterFullscreen = (el: HTMLElement) => {
  if (getFullscreenElement()) return;
  const target = el as WebkitElement;
  try {
    if (target.requestFullscreen) {
      target
        .requestFullscreen()
        .catch((err) => console.error("Fullscreen error:", err));
    } else {
      target.webkitRequestFullscreen?.();
    }
  } catch (err) {
    console.error("Fullscreen error:", err);
  }
};

export const exitFullscreen = () => {
  if (!getFullscreenElement()) return;
  const doc = document as WebkitDocument;
  try {
    if (doc.exitFullscreen) {
      doc.exitFullscreen().catch(() => {});
    } else {
      doc.webkitExitFullscreen?.();
    }
  } catch {
    // Already left fullscreen — nothing to do.
  }
};

type WebkitVideoElement = HTMLVideoElement & {
  webkitSupportsFullscreen?: boolean;
  webkitEnterFullscreen?: () => void;
};

/** Whether the page can make an element (not just a video) fullscreen. */
export const canFullscreenElements = () =>
  typeof document !== "undefined" &&
  !!(
    document.documentElement.requestFullscreen ||
    (document.documentElement as WebkitElement).webkitRequestFullscreen
  );

/**
 * iPhone fallback: opens the video in iOS's own fullscreen player. Custom
 * overlays don't show there, so only use it for a player without any.
 */
export const enterNativeVideoFullscreen = (video: HTMLVideoElement) => {
  const v = video as WebkitVideoElement;
  try {
    if (v.webkitSupportsFullscreen !== false) v.webkitEnterFullscreen?.();
  } catch (err) {
    console.error("Fullscreen error:", err);
  }
};
