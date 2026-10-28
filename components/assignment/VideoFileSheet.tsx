import React from "react";
import { Language } from "../../interfaces";
import { Sheet } from "../app/Sheet";
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
 * also closes). Honours the file's preventFastForward.
 */
export default function VideoFileSheet({
  open,
  url,
  name,
  lang,
  preventFastForward,
  onClose,
}: Props) {
  return (
    <Sheet open={open} onClose={onClose} size="full" ariaLabel={name}>
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
