import type { useGetAssignments } from "../../react-query";

/** One entry of the subject's assignment list, with the student's own work. */
export type AssignmentItem = NonNullable<
  ReturnType<typeof useGetAssignments>["data"]
>[number];
