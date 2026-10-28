import { profileLanguage } from "../../data/languages";
import type { Language } from "../../interfaces";
import { Sheet } from "../app/Sheet";
import PhotoEditor from "../common/PhotoEditor";

type Props = {
  file: File | null;
  lang: Language;
  onClose: () => void;
  onSave: (file: File) => Promise<void>;
};

/** Crop and rotate a picked photo, full height. */
export default function PhotoEditorSheet({
  file,
  lang,
  onClose,
  onSave,
}: Props) {
  return (
    <Sheet
      open={file !== null}
      onClose={onClose}
      size="full"
      ariaLabel={profileLanguage.adjustPhoto(lang)}
    >
      {file && <PhotoEditor file={file} onClose={onClose} onSave={onSave} />}
    </Sheet>
  );
}
