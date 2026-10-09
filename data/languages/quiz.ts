import { Language } from "../../interfaces";

const t = (en: string, th: string) => (language: Language) =>
  language === "th" ? th : en;

export const quizLanguage = {
  questionCount: (l: Language, n: number) => (l === "th" ? `${n} ข้อ` : `${n} ${n === 1 ? "question" : "questions"}`),
  timeLimit: (l: Language, minutes: number) => (l === "th" ? `เวลา ${minutes} นาที` : `${minutes} minutes`),
  noTimeLimit: t("No time limit", "ไม่จำกัดเวลา"),
  dueAt: t("Due", "กำหนดส่ง"),
  testModeNotice: t(
    "Test mode is on. Your teacher will see if you leave this screen, switch apps, use a translator, or paste text.",
    "เปิดโหมดสอบอยู่ ครูจะเห็นหากคุณออกจากหน้านี้ สลับแอป ใช้ตัวแปลภาษา หรือวางข้อความ",
  ),
  start: t("Start quiz", "เริ่มทำแบบทดสอบ"),
  emptyQuiz: t("This quiz has no questions yet.", "แบบทดสอบนี้ยังไม่มีคำถาม"),
  questionOf: (l: Language, i: number, n: number) => (l === "th" ? `ข้อ ${i} จาก ${n}` : `Question ${i} of ${n}`),
  typeSingle: t("Choose one answer", "เลือกคำตอบเดียว"),
  typeMultiple: t("Choose all that apply", "เลือกได้หลายคำตอบ"),
  typeFillBlank: t("Fill in the blank", "เติมคำในช่องว่าง"),
  points: (l: Language, n: number) => (l === "th" ? `${n} คะแนน` : `${n} ${n === 1 ? "point" : "points"}`),
  previous: t("Previous", "ก่อนหน้า"),
  next: t("Next", "ถัดไป"),
  review: t("Review & submit", "ตรวจทานและส่ง"),
  saving: t("Saving…", "กำลังบันทึก…"),
  saved: t("Saved", "บันทึกแล้ว"),
  notSaved: t("Not saved, retrying", "ยังไม่ได้บันทึก กำลังลองใหม่"),
  timeLeft: t("Time left", "เวลาที่เหลือ"),
  unansweredTitle: t("Unanswered questions", "ข้อที่ยังไม่ได้ตอบ"),
  allAnswered: t("You answered every question.", "คุณตอบครบทุกข้อแล้ว"),
  goToQuestion: (l: Language, n: number) => (l === "th" ? `ไปข้อ ${n}` : `Go to question ${n}`),
  submit: t("Submit", "ส่งคำตอบ"),
  submitConfirm: t("Submit your answers? You can't change them afterwards.", "ส่งคำตอบหรือไม่? ส่งแล้วจะแก้ไขไม่ได้"),
  submitAnyway: t("Some answers didn't save. Submit anyway?", "บางคำตอบยังไม่ได้บันทึก ส่งเลยหรือไม่?"),
  cancel: t("Cancel", "ยกเลิก"),
  timeUp: t("Time's up. Submitting your answers…", "หมดเวลา กำลังส่งคำตอบ…"),
  awayTitle: t("You left the quiz", "คุณออกจากหน้าแบบทดสอบ"),
  awayBody: (l: Language, seconds: number) =>
    l === "th"
      ? `คุณออกไป ${seconds} วินาที ครูจะเห็นข้อมูลนี้`
      : `You were away for ${seconds}s. Your teacher can see this.`,
  backToQuiz: t("Back to the quiz", "กลับไปทำแบบทดสอบ"),
  submittedTitle: t("Submitted", "ส่งแล้ว"),
  yourScore: t("Your score", "คะแนนของคุณ"),
  scoreHidden: t("Your teacher will share the score later.", "ครูจะแจ้งคะแนนภายหลัง"),
  yourAnswer: t("Your answer", "คำตอบของคุณ"),
  correctAnswer: t("Correct answer", "คำตอบที่ถูก"),
  noAnswer: t("No answer", "ไม่ได้ตอบ"),
  backToClass: t("Back to class", "กลับไปที่ห้องเรียน"),
  resetByTeacher: t("Your teacher reset this quiz. You can start again.", "ครูรีเซ็ตแบบทดสอบนี้แล้ว คุณเริ่มทำใหม่ได้"),
};
