import { Language } from "../../interfaces";

export const wordCloudLanguage = {
  title: (language: Language) =>
    language === "th" ? "เมฆคำตอบ" : "Word Cloud",
  placeholder: (language: Language) =>
    language === "th" ? "พิมพ์คำตอบของคุณ" : "Type your answer",
  submit: (language: Language) => (language === "th" ? "ส่งคำตอบ" : "Submit"),
  submitting: (language: Language) =>
    language === "th" ? "กำลังส่ง…" : "Submitting…",
  submitSuccess: (language: Language) =>
    language === "th" ? "ส่งแล้ว" : "Submitted",
  submitted: (language: Language) =>
    language === "th" ? "ส่งคำตอบเรียบร้อยแล้ว ขอบคุณ!" : "Answer submitted. Thank you!",
  closed: (language: Language) =>
    language === "th" ? "กิจกรรมนี้ปิดรับคำตอบแล้ว" : "This activity is closed",
  signInRequired: (language: Language) =>
    language === "th"
      ? "กรุณาเข้าสู่ระบบด้วยบัญชีนักเรียนก่อนตอบ"
      : "Please sign in as a student to answer",
  studentId: (language: Language) =>
    language === "th" ? "รหัสนักเรียน" : "Student ID",
  enterStudentId: (language: Language) =>
    language === "th"
      ? "กรุณากรอกรหัสนักเรียนของคุณ"
      : "Please enter your student ID",
  error: (language: Language) =>
    language === "th" ? "เกิดข้อผิดพลาด" : "Error",
  chooseProfile: (language: Language) =>
    language === "th"
      ? "เลือกชื่อของคุณเพื่อตอบคำถาม"
      : "Select your name to answer",
  searchPlaceholder: (language: Language) =>
    language === "th" ? "ค้นหาชื่อหรือเลขที่" : "Search name or number",
  selectButton: (language: Language) =>
    language === "th" ? "เลือก" : "Select",
  noStudentsFound: (language: Language) =>
    language === "th" ? "ไม่พบนักเรียน" : "No students found",
  lettersLeft: (language: Language, n: number) =>
    language === "th" ? `เหลืออีก ${n} ตัวอักษร` : `${n} letters left`,
  questionXofY: (language: Language, x: number, y: number) => {
    switch (language) {
      case "en":
        return `Question ${x} of ${y}`;
      case "th":
        return `คำถาม ${x} จาก ${y}`;
      default:
        return `Question ${x} of ${y}`;
    }
  },
  prevQuestion: (language: Language) => {
    switch (language) {
      case "en":
        return "Back";
      case "th":
        return "ย้อนกลับ";
      default:
        return "Back";
    }
  },
  nextQuestion: (language: Language) => {
    switch (language) {
      case "en":
        return "Next";
      case "th":
        return "ถัดไป";
      default:
        return "Next";
    }
  },
  liveNow: (language: Language) => {
    switch (language) {
      case "en":
        return "Live now";
      case "th":
        return "กำลังถามอยู่";
      default:
        return "Live now";
    }
  },
  waitingForTeacher: (language: Language) => {
    switch (language) {
      case "en":
        return "Waiting for the teacher to start…";
      case "th":
        return "กำลังรอครูเริ่ม…";
      default:
        return "Waiting for the teacher to start…";
    }
  },
  noAnswers: (language: Language) =>
    language === "th" ? "ยังไม่มีคำตอบ" : "No answers yet",
  answeredBy: (language: Language) =>
    language === "th" ? "ตอบโดย" : "Answered by",
  answers: (language: Language) =>
    language === "th" ? "คำตอบ" : "answers",
  cloudView: (language: Language) => (language === "th" ? "เมฆคำ" : "Cloud"),
  barsView: (language: Language) => (language === "th" ? "แท่ง" : "Bars"),
  openStatus: (language: Language) => (language === "th" ? "เปิด" : "Open"),
  closedStatus: (language: Language) => (language === "th" ? "ปิด" : "Closed"),
  questionN: (language: Language, n: number) =>
    language === "th" ? `คำถามที่ ${n}` : `Question ${n}`,
  resultsTitle: (language: Language) =>
    language === "th" ? "ผลคำตอบ" : "Results",
  linkUnavailable: (language: Language) =>
    language === "th"
      ? "ลิงก์นี้ไม่สามารถใช้งานได้แล้ว"
      : "This link is no longer available",
  linkUnavailableHint: (language: Language) =>
    language === "th"
      ? "ครูอาจปิดการแชร์ผลลัพธ์แล้ว"
      : "The teacher may have removed public sharing for these results.",
} as const;
