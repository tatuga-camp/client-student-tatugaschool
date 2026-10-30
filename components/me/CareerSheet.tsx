import { profileLanguage } from "../../data/languages";
import type { Language } from "../../interfaces";
import { Sheet } from "../app/Sheet";
import MyCareerSuggest from "../student/MyCareerSuggest";

type Props = { open: boolean; onClose: () => void; lang: Language };

/** The full career report, in a tall sheet. */
export default function CareerSheet({ open, onClose, lang }: Props) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      size="full"
      ariaLabel={profileLanguage.careerMatch(lang)}
    >
      <div className="pb-4 font-Anuphan">
        <MyCareerSuggest />
      </div>
    </Sheet>
  );
}
