import Classwork from "../subject/Classwork";
import { homeLanguage } from "../../data/languages";
import { useGetLanguage } from "../../react-query";
import { SubjectChip } from "../app/SubjectChip";
import { TAB_BODY_CLASS, TabHeader } from "../app/TabHeader";
import type { TabPaneProps } from "../app/shell/useShellRoute";

/** Placeholder until Part 2 rewrites Classwork: today's list in a pane. */
export default function ClassworkTab({ subjectId }: TabPaneProps) {
  const language = useGetLanguage();
  return (
    <div className="flex h-full w-full flex-col">
      <TabHeader
        title={homeLanguage.tabClasswork(language.data ?? "en")}
        right={<SubjectChip subjectId={subjectId} />}
      />
      <div className={`${TAB_BODY_CLASS} px-3 pb-10 pt-3`}>
        <Classwork subjectId={subjectId} />
      </div>
    </div>
  );
}
