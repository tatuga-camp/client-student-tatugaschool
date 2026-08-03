export type StudentNotification = {
  id: string;
  createAt: string;
  userId?: string;
  studentId?: string;
  actorName: string;
  actorId: string;
  actorImage: string;
  type: 'STUDENT_SUBMISSION' | 'STUDENT_COMMENT' | 'NEW_ANNOUNCEMENT';
  message: string;
  link: string;
  isRead: boolean;
  schoolId: string;
  subjectId: string;
};
