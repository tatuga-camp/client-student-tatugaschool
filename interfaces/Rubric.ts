export interface RubricLevel {
  id: string;
  title: string;
  description?: string;
  points: number;
  order: number;
}

export interface RubricBreakdownCriterion {
  id: string;
  title: string;
  description?: string;
  weight: number;
  levels: RubricLevel[];
  selectedLevelId: string | null;
  points: number | null;
  comment: string | null;
}

export interface RubricBreakdown {
  studentOnAssignmentId: string;
  finalScore: number | null;
  maxScore: number | null;
  rubric: {
    id: string;
    title: string;
    criteria: RubricBreakdownCriterion[];
  } | null;
}
