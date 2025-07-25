export interface FileOnStudentOnAssignment {
  id: string;
  createAt: Date;
  updateAt: Date;
  type: string;
  body: string;
  contentType: StudentAssignmentContentType;
  name: string | null;
  size: number;
  subjectId: string;
  schoolId: string;
  studentOnAssignmentId: string;
}

export type StudentAssignmentContentType = "FILE" | "TEXT";
