import { Language } from "../../interfaces";

export const subjectsPageLanguage = {
  title: (l: Language) =>
    l === "th" ? "วิชาเรียนของฉัน" : "My Subjects",
  description: (l: Language) =>
    l === "th"
      ? "รวมรายวิชาและความก้าวหน้าของฉันในแต่ละภาคเรียน"
      : "All your subjects and progress for the term, in one place.",
  subjectsUnit: (l: Language) => (l === "th" ? "วิชา" : "subjects"),
  completedUnit: (l: Language) => (l === "th" ? "เสร็จสมบูรณ์" : "completed"),
  inProgressUnit: (l: Language) => (l === "th" ? "ยังไม่เสร็จ" : "in progress"),
  academicYear: (l: Language) => (l === "th" ? "ปีการศึกษา" : "Academic Year"),
  searchPlaceholder: (l: Language) =>
    l === "th"
      ? "ค้นหารายวิชา รหัส หรือคำอธิบาย..."
      : "Search subjects, code, or description...",
  sort: (l: Language) => (l === "th" ? "เรียงตาม" : "Sort"),
  status: (l: Language) => (l === "th" ? "สถานะ" : "Status"),
  done: (l: Language) => (l === "th" ? "เสร็จ" : "Done"),
  todo: (l: Language) => (l === "th" ? "ค้าง" : "Todo"),
  noDescription: (l: Language) =>
    l === "th" ? "ไม่มีคำอธิบาย" : "No description",
  year: (l: Language) => (l === "th" ? "ปีการศึกษา" : "Year"),
  enter: (l: Language) => (l === "th" ? "เข้าเรียน →" : "Enter →"),
  noMatch: (l: Language) =>
    l === "th" ? "ไม่พบรายวิชาที่ค้นหา" : "No matching subjects",
  noSubjects: (l: Language) =>
    l === "th" ? "ยังไม่มีวิชาเรียน" : "No subjects yet",
  noMatchHint: (l: Language) =>
    l === "th"
      ? "ลองเปลี่ยนคำค้นหาหรือล้างตัวกรองดูนะ"
      : "Try a different search term or clear your filters.",
  noSubjectsHint: (l: Language) =>
    l === "th"
      ? "เมื่อมีรายวิชาใหม่ จะปรากฏที่นี่"
      : "New subjects will appear here once added.",
  studentNotFound: (l: Language) =>
    l === "th" ? "ไม่พบนักเรียน" : "Student not found",
  sortLabels: {
    th: {
      default: "ค่าเริ่มต้น",
      newest: "ใหม่สุด",
      oldest: "เก่าสุด",
      az: "ก - ฮ",
      za: "ฮ - ก",
    },
    en: {
      default: "Default",
      newest: "Newest",
      oldest: "Oldest",
      az: "A - Z",
      za: "Z - A",
    },
  },
  statusLabels: {
    th: {
      all: "ทั้งหมด",
      complete: "งานเสร็จสมบูรณ์",
      uncomplete: "งานยังไม่เสร็จ",
    },
    en: {
      all: "All",
      complete: "Completed",
      uncomplete: "Incomplete",
    },
  },
} as const;
