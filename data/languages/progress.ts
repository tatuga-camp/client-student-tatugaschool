import { Language } from "../../interfaces";

export const progressLanguage = {
  pageTitle: (language: Language) =>
    language === "th" ? "ความคืบหน้าของห้องเรียน" : "Class progress",
  readOnly: (language: Language) =>
    language === "th" ? "ดูอย่างเดียว" : "Read-only",
  updated: (language: Language) =>
    language === "th" ? "อัปเดตล่าสุด" : "Updated",
  byAssignment: (language: Language) =>
    language === "th" ? "แยกตามงาน" : "By assignment",
  byTagGroup: (language: Language) =>
    language === "th" ? "แยกตามกลุ่มแท็ก" : "By tag group",
  search: (language: Language) =>
    language === "th" ? "ค้นหาชื่อหรือเลขที่" : "Search name or number",
  student: (language: Language) =>
    language === "th" ? "นักเรียน" : "Student",
  number: (language: Language) => (language === "th" ? "เลขที่" : "No."),
  points: (language: Language) => (language === "th" ? "คะแนน" : "pts"),
  special: (language: Language) =>
    language === "th" ? "คะแนนพิเศษ" : "Special",
  total: (language: Language) =>
    language === "th" ? "คะแนนรวม" : "Total",
  grade: (language: Language) => (language === "th" ? "เกรด" : "Grade"),
  groupTotal: (language: Language) => (language === "th" ? "รวม" : "total"),
  assignmentsCount: (language: Language, count: number) =>
    language === "th"
      ? `${count} งาน`
      : `${count} ${count === 1 ? "assignment" : "assignments"}`,
  submittedOf: (language: Language, done: number, total: number) =>
    language === "th" ? `ส่งแล้ว ${done}/${total}` : `${done}/${total} submitted`,
  reviewed: (language: Language) =>
    language === "th" ? "ตรวจแล้ว" : "Reviewed",
  waitingReview: (language: Language) =>
    language === "th" ? "รอตรวจ" : "Waiting review",
  needsImprovement: (language: Language) =>
    language === "th" ? "ต้องแก้ไข" : "Needs improvement",
  noWork: (language: Language) =>
    language === "th" ? "ยังไม่ส่ง" : "No work",
  notAssigned: (language: Language) =>
    language === "th" ? "ไม่ได้มอบหมาย" : "Not assigned",
  scoreHidden: (language: Language) =>
    language === "th" ? "ซ่อนคะแนน" : "Score hidden",
  collapseGroup: (language: Language) =>
    language === "th" ? "ย่อกลุ่ม" : "Collapse group",
  expandGroup: (language: Language) =>
    language === "th" ? "ขยายกลุ่ม" : "Expand group",
  linkUnavailable: (language: Language) =>
    language === "th"
      ? "ลิงก์นี้ใช้งานไม่ได้แล้ว"
      : "This link is no longer available",
  linkUnavailableHint: (language: Language) =>
    language === "th"
      ? "โปรดขอลิงก์ใหม่จากคุณครู"
      : "Ask the teacher for a new link.",
  loadFailed: (language: Language) =>
    language === "th" ? "โหลดข้อมูลไม่สำเร็จ" : "Could not load progress",
  retry: (language: Language) => (language === "th" ? "ลองใหม่" : "Retry"),
  noWorkYet: (language: Language) =>
    language === "th"
      ? "ยังไม่มีงานที่มอบหมาย"
      : "No work has been assigned yet.",
  noMatch: (language: Language) =>
    language === "th" ? "ไม่พบนักเรียน" : "No students match",
};
