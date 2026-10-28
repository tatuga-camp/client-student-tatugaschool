import React from "react";
import { Sheet } from "../app/Sheet";
import FileAssignmentVideoPlayer from "../common/FileAssignmentVideoPlayer";

type Props = {
  open: boolean;
  url: string;
  name: string;
  preventFastForward: boolean;
  onClose: () => void;
};

/**
 * A teacher's video file in a full sheet. The player fills the sheet (its
 * fixed layer is positioned against the sheet's transformed panel) and
 * honours the file's preventFastForward.
 */
export default function VideoFileSheet({
  open,
  url,
  name,
  preventFastForward,
  onClose,
}: Props) {
  return (
    <Sheet open={open} onClose={onClose} size="full" ariaLabel={name}>
      <FileAssignmentVideoPlayer
        src={url}
        config={{ preventFastForward }}
        onClose={onClose}
      />
    </Sheet>
  );
}
