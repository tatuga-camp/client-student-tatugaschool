import Classwork from "../subject/Classwork";
import type { TabPaneProps } from "../app/shell/useShellRoute";

/** Placeholder until Part 2 rewrites Classwork: today's list in a pane. */
export default function ClassworkTab({ subjectId }: TabPaneProps) {
  return (
    <div
      className="app-scroll h-full w-full px-3 pb-10"
      style={{ paddingTop: "calc(var(--safe-top) + 8px)" }}
    >
      <Classwork subjectId={subjectId} />
    </div>
  );
}
