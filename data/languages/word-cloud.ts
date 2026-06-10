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
} as const;
