import { useGetLanguage, useGetSubjectById } from "../../react-query";
import { homeLanguage } from "../../data/languages";
import { NotificationButton } from "../app/NotificationButton";
import { NotificationPromptSheet } from "../app/NotificationPromptSheet";
import { SubjectChip } from "../app/SubjectChip";
import type { TabPaneProps } from "../app/shell/useShellRoute";

/** Placeholder until Part 2 builds Home (the schoolyard and the mascot). */
export default function HomeTab({ subjectId, active }: TabPaneProps) {
  const subject = useGetSubjectById({ id: subjectId });
  const language = useGetLanguage();
  return (
    <div
      className="app-scroll h-full w-full px-4 pb-10 font-Anuphan"
      style={{ paddingTop: "calc(var(--safe-top) + 4px)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <SubjectChip subjectId={subjectId} />
        <NotificationButton />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-icon-color">
        {subject.data?.title ?? homeLanguage.tabHome(language.data ?? "en")}
      </h1>
      {/* Asks on its own only while Home is the tab on screen. */}
      {active && <NotificationPromptSheet />}
    </div>
  );
}
