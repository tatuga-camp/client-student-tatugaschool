import { useGetLanguage, useGetSubjectById } from "../../react-query";
import { homeLanguage } from "../../data/languages";
import type { TabPaneProps } from "../app/shell/useShellRoute";

/** Placeholder until Part 2 builds Home (the schoolyard and the mascot). */
export default function HomeTab({ subjectId }: TabPaneProps) {
  const subject = useGetSubjectById({ id: subjectId });
  const language = useGetLanguage();
  return (
    <div
      className="app-scroll h-full w-full px-4 pb-10 font-Anuphan"
      style={{ paddingTop: "calc(var(--safe-top) + 16px)" }}
    >
      <h1 className="text-2xl font-bold text-icon-color">
        {subject.data?.title ?? homeLanguage.tabHome(language.data ?? "en")}
      </h1>
    </div>
  );
}
