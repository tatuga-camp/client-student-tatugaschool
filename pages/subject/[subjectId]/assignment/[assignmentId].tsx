import type { ReactElement } from "react";
import SubjectShell from "../../../../components/app/shell/SubjectShell";

/**
 * The assignment slides in over the subject's tabs: SubjectShell reads the
 * ids from the URL and renders components/assignment/AssignmentDetail.
 */
function Page() {
  return null;
}

Page.getLayout = (page: ReactElement) => <SubjectShell>{page}</SubjectShell>;

export default Page;
