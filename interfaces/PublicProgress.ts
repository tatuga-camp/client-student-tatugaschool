export type PublicProgressLevel = "STATUS" | "SCORE" | "GRADE";

export type PublicProgressCellStatus =
  | "PENDDING"
  | "SUBMITTED"
  | "IMPROVED"
  | "REVIEWD"
  | "NONE";

export type PublicProgressCell = {
  status: PublicProgressCellStatus;
  score?: number;
};

export type PublicProgressAssignmentColumn = {
  kind: "assignment";
  id: string;
  title: string;
  tag: string | null;
  scoreHidden: boolean;
  maxScore?: number;
  weight?: number | null;
};

export type PublicProgressSpecialColumn = {
  kind: "special";
  id: string;
  title: string;
  maxScore?: number | null;
  weight?: number | null;
};

export type PublicProgressColumn =
  | PublicProgressAssignmentColumn
  | PublicProgressSpecialColumn;

export type PublicProgressGroup = {
  tag: string;
  assignmentIds: string[];
  maxTotal?: number;
};

export type PublicProgressStudent = {
  id: string;
  number: string;
  title: string;
  firstName: string;
  lastName: string;
  photo: string;
  blurHash: string | null;
  submittedCount: number;
  assignedCount: number;
  cells: Record<string, PublicProgressCell>;
  groupTotals?: Record<string, number>;
  total?: number;
  grade?: string;
};

export type PublicProgress = {
  subject: {
    title: string;
    educationYear: string;
    className: string;
    backgroundImage: string | null;
  };
  level: PublicProgressLevel;
  columns: PublicProgressColumn[];
  groups: PublicProgressGroup[];
  maxTotal?: number;
  students: PublicProgressStudent[];
  updatedAt: string;
};
