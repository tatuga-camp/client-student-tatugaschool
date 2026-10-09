import { Language } from "../../interfaces";

const t = (en: string, th: string) => (language: Language) =>
  language === "th" ? th : en;

export const subjectHomeLanguage = {
  // Classwork switch
  tabAssignments: t("Assignments", "งาน"),
  tabAnnouncements: t("Announcements", "ประกาศ"),
  todoCount: (l: Language, n: number) =>
    l === "th" ? `ค้าง ${n}` : `${n} to do`,

  // Status filter
  filterAll: t("All", "ทั้งหมด"),
  filterTodo: t("To do", "ต้องทำ"),
  filterSubmitted: t("Submitted", "ส่งแล้ว"),
  filterGraded: t("Graded", "ตรวจแล้ว"),

  // Card type labels
  typeAssignment: t("Assignment", "งาน"),
  typeQuiz: t("Quiz", "แบบทดสอบ"),
  typeVideo: t("Video quiz", "วิดีโอ"),
  typeMaterial: t("Material", "เอกสาร"),

  // Due chips
  dueOverdue: (l: Language, date: string) =>
    l === "th" ? `เลยกำหนด · ${date}` : `Late · ${date}`,
  dueSoon: (l: Language, date: string) =>
    l === "th" ? `ใกล้ถึงกำหนด · ${date}` : `Due soon · ${date}`,
  dueLater: (l: Language, date: string) =>
    l === "th" ? `ส่ง ${date}` : `Due ${date}`,
  weightOfGrade: (l: Language, n: number) =>
    l === "th" ? `${n}% ของคะแนน` : `${n}% of grade`,
  fileCount: (l: Language, n: number) =>
    l === "th" ? `ไฟล์แนบ ${n}` : `${n} ${n === 1 ? "file" : "files"}`,
  rubric: t("Rubric", "เกณฑ์การให้คะแนน"),
  lockedHint: t(
    "Finish the work before this one first",
    "ทำงานก่อนหน้าให้เสร็จก่อนนะ",
  ),

  // Empty states
  emptyTodo: t("All done! Nothing left to do", "เย้! ไม่มีงานค้างแล้ว"),
  emptyFilter: t("Nothing here yet", "ยังไม่มีงานในหมวดนี้"),
  emptyClasswork: t("No classwork yet", "ยังไม่มีงานในวิชานี้"),
  emptyAnnouncements: t("No announcements yet", "ยังไม่มีประกาศ"),

  // Attendance
  attendanceTitle: t("My attendance", "การเข้าเรียนของฉัน"),
  attendanceSubtitle: t(
    "Every class your teacher has checked",
    "ทุกคาบที่คุณครูเช็คชื่อแล้ว",
  ),
  bestOf: (l: Language, title: string, n: number, total: number) =>
    l === "th" ? `${title} ${n} จาก ${total} ครั้ง` : `${title} ${n} of ${total} times`,
  cheerGreat: t("Amazing! Keep it up 🌟", "เยี่ยมมาก! รักษาไว้นะ 🌟"),
  cheerGood: t("Nice work 👍", "ดีมาก 👍"),
  cheerLow: t("Let's come to class more 💪", "มาเรียนให้บ่อยขึ้นนะ 💪"),
  classesChecked: (l: Language, n: number) =>
    l === "th" ? `เช็คชื่อแล้ว ${n} ครั้ง` : `${n} ${n === 1 ? "class" : "classes"} checked`,
  noAttendance: t("No attendance yet", "ยังไม่มีการเช็คชื่อ"),
  notChecked: t("Not checked", "ยังไม่เช็ค"),
  note: t("Note", "บันทึก"),

  // Score
  totalPoints: t("Total points", "คะแนนรวม"),
  currentGrade: t("Grade", "เกรด"),
  assignmentPoints: t("Classwork", "คะแนนงาน"),
  specialPoints: t("Special", "คะแนนพิเศษ"),
  assignmentScores: t("Classwork scores", "คะแนนงาน"),
  specialScores: t("Special scores", "คะแนนพิเศษ"),
  noScores: t("No scores yet", "ยังไม่มีคะแนน"),
};
