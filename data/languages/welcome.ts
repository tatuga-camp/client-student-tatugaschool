import { Language } from "../../interfaces";

export const welcomeDataLanguage = {
  title: (language: Language) =>
    language === "th" ? "เข้าร่วมห้องเรียน" : "Join your class",
  description: (language: Language) =>
    language === "th"
      ? "ใส่รหัส 6 หลักที่คุณครูให้"
      : "Type the 6-character code your teacher gave you.",
  codeLabel: (language: Language) =>
    language === "th" ? "รหัสห้องเรียน" : "Class code",
  join: (language: Language) => (language === "th" ? "เข้าร่วม" : "Join"),
  joining: (language: Language) =>
    language === "th" ? "กำลังตรวจสอบ..." : "Checking...",
  notFound: (language: Language) =>
    language === "th" ? "ไม่พบห้องเรียนนี้" : "We couldn't find that class",
  hint: (language: Language) =>
    language === "th"
      ? "ได้รับลิงก์หรือ QR code จากคุณครูแล้วใช่ไหม? แค่เปิดได้เลย ไม่ต้องใส่รหัส"
      : "Got a link or QR code from your teacher? Just open it, no code needed.",
} as const;
