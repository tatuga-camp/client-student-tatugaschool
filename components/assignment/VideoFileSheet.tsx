import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Language } from "../../interfaces";
import { keepTabInside } from "../../utils/focusTrap";
import { overlayTarget } from "../../utils/frameRoutes";
import { useModalLayer } from "../app/modalLayers";
import { Sheet } from "../app/Sheet";
import { useIsDesktop } from "../app/useLayoutMode";
import FileAssignmentVideoPlayer from "../common/FileAssignmentVideoPlayer";

type Props = {
  open: boolean;
  url: string;
  name: string;
  lang: Language;
  preventFastForward: boolean;
  onClose: () => void;
};

/**
 * A teacher's video file in a full sheet. The player's fixed layer is
 * positioned against the sheet's transformed panel and covers the sheet's own
 * handle and X, so the player's back button is the one visible close (Esc
 * also closes). Honours the file's preventFastForward. On a computer it is
 * not a sheet: the player covers the whole window (it is `fixed inset-0`),
 * and closing it unmounts it, which stops the video.
 */
export default function VideoFileSheet(props: Props) {
  const liveDesktop = useIsDesktop();
  // Picked when the video opens and kept until it closes: a snapped window
  // going fullscreen, or an iPad rotating, crosses 768 and would otherwise
  // swap the player out (a remount restarts the video and drops fullscreen).
  const desktop = useRef(liveDesktop);
  if (!props.open) desktop.current = liveDesktop;
  return desktop.current ? (
    <WindowVideo {...props} />
  ) : (
    <SheetVideo {...props} />
  );
}

function SheetVideo({
  open,
  url,
  name,
  lang,
  preventFastForward,
  onClose,
}: Props) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      size="full"
      closeButton={false}
      ariaLabel={name}
    >
      <FileAssignmentVideoPlayer
        src={url}
        name={name}
        lang={lang}
        preventFastForward={preventFastForward}
        onClose={onClose}
      />
    </Sheet>
  );
}

function WindowVideo({
  open,
  url,
  name,
  lang,
  preventFastForward,
  onClose,
}: Props) {
  // A back press closes it; the layers below are inert meanwhile.
  useModalLayer(open, onClose);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    // Focus goes into the player, and back to the file row when it closes.
    const opener = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
      // Tab stays in the player: the page behind it is out of reach.
      if (e.key === "Tab") keepTabInside(e, dialogRef.current);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open]);
  if (!open) return null;
  return createPortal(
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={name}
      data-no-swipe
      className="outline-none"
    >
      <FileAssignmentVideoPlayer
        src={url}
        name={name}
        lang={lang}
        preventFastForward={preventFastForward}
        onClose={onClose}
      />
    </div>,
    overlayTarget(),
  );
}
