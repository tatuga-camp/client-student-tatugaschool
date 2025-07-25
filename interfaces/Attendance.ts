export interface Attendance {
  id: string;
  createAt: Date;
  updateAt: Date;
  startDate: Date;
  endDate: Date;
  status: string;
  note: string | null;
  attendanceTableId: string;
  studentId: string;
  attendanceRowId: string;
  studentOnSubjectId: string;
  schoolId: string;
  subjectId: string;
}
