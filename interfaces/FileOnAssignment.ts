export interface FileOnAssignment {
  id: string;
  createAt: Date;
  updateAt: Date;
  type: string;
  url: string;
  name: string | null;
  size: number;
  subjectId: string;
  schoolId: string;
  preventFastForward?: boolean;
  assignmentId: string;
}
