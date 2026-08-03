export type FileOnAnnouncement = {
  id: string;
  createAt: string;
  updateAt: string;
  type?: string;
  url: string;
  name?: string;
  size: number;
  blurHash?: string;
  announcementId: string;
  subjectId: string;
  schoolId: string;
};

export type ReactionOnAnnouncement = {
  id: string;
  createAt: string;
  updateAt: string;
  emoji: string;
  firstName: string;
  photo?: string;
  announcementId: string;
  subjectId: string;
  schoolId: string;
  studentId?: string;
  userId?: string;
};

export type CommentOnAnnouncement = {
  id: string;
  createAt: string;
  updateAt: string;
  content: string;
  title: string;
  firstName: string;
  lastName: string;
  photo?: string;
  blurHash?: string;
  number?: string;
  role?: string;
  email?: string;
  announcementId: string;
  subjectId: string;
  schoolId: string;
  studentId?: string;
  userId?: string;
};

export type Announcement = {
  id: string;
  createAt: string;
  updateAt: string;
  title: string;
  content: string;
  firstName: string;
  lastName: string;
  photo?: string;
  blurHash?: string;
  userId: string;
  subjectId: string;
  schoolId: string;
  files: FileOnAnnouncement[];
  reactions: ReactionOnAnnouncement[];
  _count: { comments: number };
};
