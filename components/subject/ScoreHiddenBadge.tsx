import { IoEyeOffOutline } from "react-icons/io5";
import { classworkCardDataLanguage } from "../../data/languages";
import { useGetLanguage } from "../../react-query";

type Props = {
  size?: "sm" | "md";
};

function ScoreHiddenBadge({ size = "sm" }: Props) {
  const language = useGetLanguage();
  const sizing =
    size === "md" ? "px-3.5 py-1.5 text-base" : "px-3 py-1 text-sm";
  return (
    <span
      data-testid="score-hidden-badge"
      className={`inline-flex items-center gap-1.5 rounded-full bg-gray-100 font-medium text-gray-500 ${sizing}`}
    >
      <IoEyeOffOutline aria-hidden className="shrink-0" />
      {classworkCardDataLanguage.scoreHidden(language.data ?? "en")}
    </span>
  );
}

export default ScoreHiddenBadge;
