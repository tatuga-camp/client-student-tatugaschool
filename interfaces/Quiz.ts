export type QuizQuestionType = "SINGLE" | "MULTIPLE" | "FILL_BLANK";
export type QuizScoringMode = "ALL_OR_NOTHING" | "PARTIAL";

export type QuizSettings = {
  scoringMode: QuizScoringMode;
  timeLimitMinutes: number | null;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  testMode: boolean;
  showAnswersAfterSubmit: boolean;
};

export type StudentQuizQuestion = {
  id: string;
  order: number;
  type: QuizQuestionType;
  prompt: string;
  imageUrl: string | null;
  points: number;
  options: { id: string; text: string; imageUrl: string | null }[];
  blanks: { id: string }[];
};

export type StudentQuizResultQuestion = StudentQuizQuestion & {
  correctOptionIds: string[];
  acceptedAnswers: { blankId: string; answers: string[] }[];
  score: number;
};

export type QuizAnswerDraft = {
  selectedOptionIds: string[];
  blankAnswers: { blankId: string; value: string }[];
};

export type StudentQuizView = {
  assignment: {
    id: string;
    title: string;
    description: string | null;
    dueDate: string | null;
    maxScore: number | null;
    allowStudentViewScore: boolean;
    quizSettings: QuizSettings;
  };
  serverNow: string;
  questionCount: number;
  attempt: {
    startedAt: string;
    deadlineAt: string | null;
    submittedAt: string | null;
  } | null;
  questions: StudentQuizQuestion[];
  answers: ({ questionId: string } & QuizAnswerDraft)[];
  result: {
    score: number;
    maxScore: number;
    questions: StudentQuizResultQuestion[] | null;
  } | null;
};

export type IntegrityEventType =
  | "HIDDEN"
  | "VISIBLE"
  | "BLUR"
  | "FOCUS"
  | "TRANSLATE_DETECTED"
  | "COPY_ATTEMPT"
  | "PASTE_ATTEMPT"
  | "FULLSCREEN_EXIT"
  | "SCREENSHOT_KEY"
  | "PAGE_HIDE"
  | "PAGE_SHOW";

export type IntegrityEvent = {
  type: IntegrityEventType;
  clientAt: string;
  durationMs?: number;
};
