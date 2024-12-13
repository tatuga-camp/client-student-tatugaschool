export interface Student {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  firstName: string;
  lastName: string;
  photo: string;
  blurHash?: string;
  number: string;
  schoolId: string;
  classId: string;
}
