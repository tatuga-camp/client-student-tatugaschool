import { StudentOnSubject } from "./StudentOnSubject";

export type WordCloudStatus = "OPEN" | "CLOSED";
export type WordCloudAccess = "PUBLIC" | "STUDENTS_ONLY";

export interface WordCloudPublic {
  id: string;
  question: string;
  status: WordCloudStatus;
  accessMode: WordCloudAccess;
  subjectId: string;
  allowMultiple: boolean;
  students: StudentOnSubject[]; // subject roster, only populated for STUDENTS_ONLY
}

export interface PublicSetQuestion {
  id: string;
  question: string;
  order: number;
  status: WordCloudStatus;
}

export interface WordCloudSetPublic {
  id: string;
  status: WordCloudStatus;
  accessMode: WordCloudAccess;
  allowMultiple: boolean;
  subjectId: string;
  activeWordCloudId: string | null;
  questions: PublicSetQuestion[];
  students: StudentOnSubject[];
}
