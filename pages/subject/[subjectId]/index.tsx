import type { ReactElement } from "react";
import SubjectShell from "../../../components/app/shell/SubjectShell";

/** The subject's tabs live in SubjectShell, which persists across pages. */
function Page() {
  return null;
}

Page.getLayout = (page: ReactElement) => <SubjectShell>{page}</SubjectShell>;

export default Page;
